/* ==========================================================================
   app.js — Bootstrap + router untuk halaman publik, pemohon, dan admin
   ========================================================================== */
(function () {
  const PUBLIC_ROUTES = ["beranda", "tentang", "katalog", "panduan", "faq", "login", "register", "lupa-password"];

  function parseQuery(str) {
    const out = {};
    String(str || "").split("&").forEach(function (pair) {
      if (!pair) return;
      const idx = pair.indexOf("=");
      const key = decodeURIComponent(idx === -1 ? pair : pair.slice(0, idx));
      const val = idx === -1 ? "" : decodeURIComponent(pair.slice(idx + 1));
      out[key] = val;
    });
    return out;
  }

  App.App = {
    parseRoute() {
      const raw = (location.hash || "").replace(/^#\/?/, "");
      const qIndex = raw.indexOf("?");
      const path = qIndex === -1 ? raw : raw.slice(0, qIndex);
      const query = qIndex === -1 ? "" : raw.slice(qIndex + 1);
      const parts = path.split("/").filter(Boolean);

      if (!parts.length) return { area: "public", route: "beranda", param: null, query: {} };
      if (parts[0] === "admin") return { area: "admin", route: parts[1] || "dashboard", param: parts[2] || null, query: parseQuery(query) };
      if (parts[0] === "saya") {
        const route = parts[1] || "dashboard";
        const aliases = { permohonan: "requests", notifikasi: "notifications", pengaturan: "settings" };
        return { area: "saya", route: aliases[route] || route, param: parts[2] || null, query: parseQuery(query) };
      }
      if (PUBLIC_ROUTES.indexOf(parts[0]) !== -1) return { area: "public", route: parts[0], param: parts[1] || null, query: parseQuery(query) };

      // Kompatibilitas dengan tautan lama: arahkan ke dashboard sesuai peran.
      return { area: "legacy", route: parts[0], param: parts[1] || null, query: parseQuery(query) };
    },

    redirect(hash) {
      if (location.hash !== hash) location.hash = hash;
      else this.render();
    },

    render() {
      let target = this.parseRoute();

      if (target.area === "legacy") {
        return this.redirect(App.Auth.isLoggedIn() ? App.Auth.homeHash() : "#/beranda");
      }

      if (target.area !== "public" && !App.Auth.isLoggedIn()) {
        App.Auth.rememberReturn(location.hash);
        return this.redirect("#/login");
      }

      if (target.area === "admin" && !App.Auth.isStaff()) {
        App.toast("Akses ditolak", "Halaman tersebut hanya untuk admin dan petugas.", "error");
        return this.redirect("#/saya/dashboard");
      }
      if (target.area === "saya" && !App.Auth.isPemohon()) {
        App.toast("Akses ditolak", "Gunakan panel administrasi untuk akun Anda.", "error");
        return this.redirect("#/admin/dashboard");
      }

      if (target.area === "public") {
        App.Layout.destroy();
        App.Auth.render(target.route, target.param);
        return;
      }

      if (!document.querySelector(".app-shell")) App.Layout.mount();

      const pageMap = target.area === "admin" ? (App.Pages || {}) : (App.ApplicantPages || {});
      const page = pageMap[target.route];
      const menu = App.Layout.routeMap[target.route] || null;

      App.Layout.setActive(target.route);
      App.Layout.setTitle(menu ? menu.label : (page ? page.title : "Halaman"), menu ? menu.subtitle : (page ? page.subtitle : ""));
      App.Layout.closeDropdowns();
      App.Layout.refresh();

      try {
        App.Layout.setContent(page ? page.render(target.param, target.query) :
          '<div class="card">' + App.empty("Halaman belum tersedia", "Modul ini akan segera ditambahkan.", "compass") + "</div>");
        if (page && page.mount) page.mount(document.getElementById("page-content"), target.param, target.query);
      } catch (err) {
        console.error("Render error:", err);
        App.Layout.setContent('<div class="card">' + App.empty("Halaman gagal dimuat", err.message || "Terjadi kesalahan saat menampilkan halaman.", "alertCircle") + "</div>");
        App.toast("Error", "Halaman gagal dimuat.", "error");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    },

    start() {
      App.Store.init();
      App.Auth.initFallbackHashes();
      this.render();
    }
  };

  window.addEventListener("hashchange", function () { App.App.render(); });

  document.addEventListener("DOMContentLoaded", function () { App.App.start(); });
})();
