/* ==========================================================================
   layout.js — Shell dashboard (admin & pemohon), sidebar, topbar, notifikasi
   ========================================================================== */
(function () {
  const staffMenus = [
    { route: "dashboard", label: "Dashboard Admin", icon: "grid", hash: "#/admin/dashboard", subtitle: "Ringkasan seluruh aktivitas permohonan", group: "Utama" },
    { route: "requests", label: "Data Permohonan", icon: "files", hash: "#/admin/requests", subtitle: "Kelola seluruh permohonan masuk", group: "Utama" },
    { route: "verification", label: "Verifikasi Permohonan", icon: "checkSquare", hash: "#/admin/verification", subtitle: "Periksa dan tentukan hasil verifikasi", group: "Utama" },
    { route: "repair", label: "Perlu Perbaikan", icon: "alert", hash: "#/admin/repair", subtitle: "Tindak lanjut permohonan yang belum memenuhi syarat", group: "Utama" },
    { route: "uploads", label: "Pengelolaan File Data", icon: "upload", hash: "#/admin/uploads", subtitle: "Kelola file hasil permohonan", group: "Utama" },
    { route: "categories", label: "Kategori Data", icon: "folder", hash: "#/admin/categories", subtitle: "Kelola kategori data yang dapat dimohonkan", group: "Manajemen" },
    { route: "users", label: "Manajemen Pengguna", icon: "users", hash: "#/admin/users", subtitle: "Kelola akun dan hak akses pengguna", group: "Manajemen" },
    { route: "activity", label: "Riwayat Aktivitas", icon: "history", hash: "#/admin/activity", subtitle: "Catatan seluruh tindakan petugas", group: "Manajemen" },
    { route: "notifications", label: "Notifikasi", icon: "bell", hash: "#/admin/notifications", subtitle: "Pemberitahuan perubahan status", group: "Manajemen" },
    { route: "settings", label: "Pengaturan Akun", icon: "settings", hash: "#/admin/settings", subtitle: "Kelola profil dan preferensi akun", group: "Manajemen" }
  ];

  const applicantMenus = [
    { route: "dashboard", label: "Dashboard", icon: "home", hash: "#/saya/dashboard", subtitle: "Ringkasan permohonan Anda", group: "Utama" },
    { route: "baru", label: "Buat Permohonan", icon: "plus", hash: "#/saya/baru", subtitle: "Ajukan permohonan data baru", group: "Utama" },
    { route: "requests", label: "Permohonan Saya", icon: "files", hash: "#/saya/permohonan", subtitle: "Daftar seluruh pengajuan Anda", group: "Utama" },
    { route: "tracking", label: "Tracking Status", icon: "activity", hash: "#/saya/tracking", subtitle: "Pantau perkembangan pengajuan", group: "Utama" },
    { route: "notifications", label: "Notifikasi", icon: "bell", hash: "#/saya/notifikasi", subtitle: "Pemberitahuan perubahan status", group: "Akun" },
    { route: "profil", label: "Profil Saya", icon: "user", hash: "#/saya/profil", subtitle: "Kelola data identitas pemohon", group: "Akun" },
    { route: "settings", label: "Pengaturan Akun", icon: "settings", hash: "#/saya/pengaturan", subtitle: "Ubah password dan preferensi", group: "Akun" }
  ];

  App.Layout = {
    menus: [],
    routeMap: {},

    currentMenus() {
      return App.Auth.isStaff() ? staffMenus : applicantMenus;
    },

    mount() {
      const app = document.getElementById("app");
      const user = App.Auth.currentUser();
      if (!user) return;
      this.menus = this.currentMenus();
      this.routeMap = {};
      this.menus.forEach(function (m) { App.Layout.routeMap[m.route] = m; });

      const groups = [];
      this.menus.forEach(function (m) {
        let g = groups.find(function (x) { return x.name === m.group; });
        if (!g) { g = { name: m.group, items: [] }; groups.push(g); }
        g.items.push(m);
      });

      app.innerHTML =
        '<div class="app-shell">' +
          '<aside class="sidebar" id="sidebar">' +
            '<div class="sidebar__brand">' +
              '<a class="brand__mark" href="' + App.Auth.homeHash() + '">' + App.icon("layers") + "</a>" +
              '<div class="brand__text"><strong>SIRADA BBWS</strong><span>' + (App.Auth.isStaff() ? "PANEL ADMINISTRASI" : "PORTAL PEMOHON") + "</span></div>" +
            "</div>" +
            '<nav class="sidebar__nav">' +
              groups.map(function (g) {
                return '<div class="sidebar__label">' + App.h(g.name) + "</div><ul class=\"nav-list\">" + g.items.map(function (m) {
                  return '<li class="nav-item"><a class="nav-link" data-route="' + m.route + '" href="' + m.hash + '">' +
                    App.icon(m.icon) + "<span>" + App.h(m.label) + "</span></a></li>";
                }).join("") + "</ul>";
              }).join("") +
            "</nav>" +
            '<div class="sidebar__footer"><strong>SIRADA v1.0</strong> · BBWS Bengawan Solo</div>' +
          "</aside>" +
          '<div class="sidebar-overlay" id="sidebar-overlay"></div>' +
          '<main class="main">' +
            '<header class="topbar">' +
              '<div class="topbar__left">' +
                '<button class="menu-toggle" id="menu-toggle" type="button" aria-label="Buka menu">' + App.icon("menu") + "</button>" +
                '<div class="page-heading"><h1 id="page-title">Dashboard</h1><p id="page-subtitle"></p></div>' +
              "</div>" +
              '<div class="topbar__actions">' +
                '<div style="position:relative"><button class="icon-btn" id="notification-btn" type="button" aria-label="Notifikasi">' +
                  App.icon("bell") + '<span class="badge-dot" id="notification-count">0</span></button>' +
                  '<div id="notification-dropdown" style="display:none"></div></div>' +
                (App.Auth.isStaff() ? '<a class="btn btn--outline btn--sm topbar__home" href="#/beranda">' + App.icon("globe") + "Situs Publik</a>" : "") +
                '<div style="position:relative"><button class="profile-btn" id="profile-btn" type="button">' +
                  '<span class="avatar">' + App.h(App.initials(user.name)) + "</span>" +
                  '<span class="profile-btn__meta"><strong>' + App.h(user.name) + "</strong><span>" + App.h(user.role) + "</span></span>" + App.icon("chevron") +
                  "</button>" +
                  '<div id="profile-dropdown" style="display:none"></div></div>' +
              "</div>" +
            "</header>" +
            '<div class="page-content" id="page-content"></div>' +
          "</main>" +
        "</div>";
      this.bind();
      this.refresh();
    },

    destroy() {
      ["sidebar", "sidebar-overlay", "notification-dropdown", "profile-dropdown"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      this._documentBound = false;
    },

    bind() {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebar-overlay");
      document.getElementById("menu-toggle").addEventListener("click", function () {
        sidebar.classList.add("open"); overlay.classList.add("show");
      });
      overlay.addEventListener("click", function () {
        sidebar.classList.remove("open"); overlay.classList.remove("show");
      });
      document.querySelectorAll(".nav-link[data-route]").forEach(function (link) {
        link.addEventListener("click", function () {
          sidebar.classList.remove("open"); overlay.classList.remove("show");
          App.Layout.closeDropdowns();
        });
      });

      document.getElementById("notification-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        const dd = document.getElementById("notification-dropdown");
        const profile = document.getElementById("profile-dropdown");
        profile.style.display = "none";
        if (dd.style.display === "none") { App.Layout.renderNotifications(); dd.style.display = "block"; }
        else dd.style.display = "none";
      });

      document.getElementById("profile-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        const dd = document.getElementById("profile-dropdown");
        const notif = document.getElementById("notification-dropdown");
        notif.style.display = "none";
        if (dd.style.display === "none") { App.Layout.renderProfile(); dd.style.display = "block"; }
        else dd.style.display = "none";
      });

      if (!this._documentBound) {
        document.addEventListener("click", function (e) {
          const notification = document.getElementById("notification-dropdown");
          const profile = document.getElementById("profile-dropdown");
          if (notification && !e.target.closest("#notification-btn") && !e.target.closest("#notification-dropdown")) notification.style.display = "none";
          if (profile && !e.target.closest("#profile-btn") && !e.target.closest("#profile-dropdown")) profile.style.display = "none";
        });
        this._documentBound = true;
      }
    },

    closeDropdowns() {
      const n = document.getElementById("notification-dropdown");
      const p = document.getElementById("profile-dropdown");
      if (n) n.style.display = "none";
      if (p) p.style.display = "none";
    },

    refresh() {
      const state = App.Store.get();
      const user = App.Auth.currentUser();
      let count = 0;
      if (App.Auth.isStaff()) {
        count = state.requests.filter(function (r) {
          return ["Diajukan", "Menunggu Verifikasi", "Perlu Perbaikan"].indexOf(r.status) !== -1;
        }).length;
      } else if (user) {
        count = state.notifications.filter(function (n) { return n.userId === user.id && !n.read; }).length;
      }
      const el = document.getElementById("notification-count");
      if (el) {
        el.textContent = count > 99 ? "99+" : count;
        el.style.display = count ? "grid" : "none";
      }
    },

    renderNotifications() {
      const state = App.Store.get();
      const dd = document.getElementById("notification-dropdown");
      dd.className = "dropdown";

      if (App.Auth.isStaff()) {
        const pending = state.requests.filter(function (r) {
          return ["Diajukan", "Menunggu Verifikasi", "Perlu Perbaikan"].indexOf(r.status) !== -1;
        }).sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); }).slice(0, 5);
        dd.innerHTML = '<div class="dropdown__head"><strong>Notifikasi</strong><span>' + pending.length + " perlu tindakan</span></div>" +
          '<div class="dropdown__body">' + (pending.length ? pending.map(function (r) {
            return '<button class="dropdown__item" type="button" data-notif-id="' + App.h(r.id) + '">' +
              '<span class="dropdown__icon">' + App.icon(r.status === "Perlu Perbaikan" ? "alert" : "file") + "</span>" +
              "<span><strong>" + App.h(r.id) + " · " + App.h(r.applicant) + "</strong><span>" + App.h(r.status) + " — " + App.timeAgo(r.submittedAt) + "</span></span></button>";
          }).join("") : App.empty("Tidak ada notifikasi", "Semua permohonan sudah tertangani.")) + "</div>" +
          '<div class="dropdown__footer"><a href="#/admin/requests">Lihat semua permohonan</a></div>';
        dd.querySelectorAll("[data-notif-id]").forEach(function (btn) {
          btn.addEventListener("click", function () { dd.style.display = "none"; location.hash = "#/admin/verification/" + encodeURIComponent(btn.dataset.notifId); });
        });
        return;
      }

      const user = App.Auth.currentUser();
      const items = state.notifications.filter(function (n) { return n.userId === user.id; })
        .sort(function (a, b) { return new Date(b.at) - new Date(a.at); }).slice(0, 6);
      dd.innerHTML = '<div class="dropdown__head"><strong>Notifikasi</strong><button type="button" id="mark-read">Tandai dibaca</button></div>' +
        '<div class="dropdown__body">' + (items.length ? items.map(function (n) {
          return '<button class="dropdown__item" type="button" data-notif-link="' + App.h(n.requestId || "") + '" data-notif-id="' + App.h(n.id) + '">' +
            '<span class="dropdown__icon">' + App.icon(n.type === "warning" ? "alert" : n.type === "error" ? "alertCircle" : n.type === "success" ? "checkCircle" : "info") + "</span>" +
            "<span><strong>" + App.h(n.title) + "</strong><span>" + App.h(n.message) + " · " + App.timeAgo(n.at) + "</span></span>" + (n.read ? "" : '<i class="notif-unread"></i>') + "</button>";
        }).join("") : App.empty("Belum ada notifikasi", "Notifikasi akan muncul saat status permohonan berubah.")) + "</div>" +
        '<div class="dropdown__footer"><a href="#/saya/notifikasi">Lihat semua notifikasi</a></div>';

      dd.querySelectorAll("[data-notif-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const id = btn.dataset.notifId;
          App.Store.update(function (s) {
            const n = s.notifications.find(function (x) { return x.id === id; });
            if (n) n.read = true;
          });
          dd.style.display = "none";
          App.Layout.refresh();
          if (btn.dataset.notifLink) location.hash = "#/saya/detail/" + encodeURIComponent(btn.dataset.notifLink);
          else location.hash = "#/saya/notifikasi";
        });
      });
      const mark = dd.querySelector("#mark-read");
      if (mark) mark.addEventListener("click", function () {
        App.Store.update(function (s) {
          s.notifications.forEach(function (n) { if (n.userId === user.id) n.read = true; });
        });
        App.Layout.refresh();
        dd.style.display = "none";
        App.toast("Notifikasi", "Semua notifikasi ditandai sudah dibaca.", "info");
      });
    },

    renderProfile() {
      const dd = document.getElementById("profile-dropdown");
      const user = App.Auth.currentUser();
      dd.className = "dropdown dropdown--small";
      dd.innerHTML = '<div class="dropdown__profile"><span class="avatar avatar--lg">' + App.h(App.initials(user.name)) + "</span>" +
        "<div><strong>" + App.h(user.name) + "</strong><span>" + App.h(user.email) + "</span></div></div>" +
        '<a class="dropdown__item" href="' + (App.Auth.isStaff() ? "#/admin/settings" : "#/saya/profil") + '"><span class="dropdown__icon">' + App.icon("user") + "</span>" +
          "<span><strong>Profil Saya</strong><span>Kelola informasi akun</span></span></a>" +
        '<a class="dropdown__item" href="' + (App.Auth.isStaff() ? "#/admin/notifications" : "#/saya/notifikasi") + '"><span class="dropdown__icon">' + App.icon("bell") + "</span>" +
          "<span><strong>Notifikasi</strong><span>Pemberitahuan sistem</span></span></a>" +
        '<button class="dropdown__logout" type="button" id="profile-logout">' + App.icon("logout") + "Logout</button>";
      dd.querySelector("#profile-logout").addEventListener("click", function () { App.Auth.logout(); });
      dd.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { dd.style.display = "none"; }); });
    },

    setActive(route) {
      document.querySelectorAll(".nav-link[data-route]").forEach(function (link) {
        link.classList.toggle("active", link.dataset.route === route);
      });
    },

    setTitle(title, subtitle) {
      const t = document.getElementById("page-title");
      const s = document.getElementById("page-subtitle");
      if (t) t.textContent = title;
      if (s) s.textContent = subtitle || "";
    },

    setContent(html) {
      const root = document.getElementById("page-content");
      if (root) root.innerHTML = html;
    }
  };
})();
