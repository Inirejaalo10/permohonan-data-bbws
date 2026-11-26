/* ==========================================================================
   auth.js — Autentikasi, registrasi, dan halaman publik SIRADA BBWS
   ========================================================================== */
(function () {
  const SESSION_KEY = "sirada-session";
  const RETURN_KEY = "sirada-return";
  const SALT = "sirada-bbws|";

  function fallbackHash(password) {
    let h = 2166136261;
    const str = SALT + password;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return "fnv-" + (h >>> 0).toString(16).padStart(8, "0");
  }

  App.Auth = {
    sessionKey: SESSION_KEY,

    hasCrypto() { return !!(window.crypto && window.crypto.subtle && window.crypto.subtle.digest); },

    async hash(password) {
      if (!this.hasCrypto()) return fallbackHash(password);
      try {
        const bytes = new TextEncoder().encode(SALT + password);
        const digest = await window.crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      } catch (e) {
        return fallbackHash(password);
      }
    },

    initFallbackHashes() {
      if (this.hasCrypto()) return;
      App.Store.update(function (s) {
        s.users.forEach(function (u) {
          if (u.role === "Pemohon") u.passwordHash = fallbackHash("pemohon123");
          else u.passwordHash = fallbackHash("admin123");
        });
      });
    },

    currentUser() {
      const id = sessionStorage.getItem(SESSION_KEY);
      if (!id) return null;
      const user = App.Store.get().users.find(function (u) { return u.id === id; });
      return user && user.status === "Aktif" ? user : null;
    },

    isLoggedIn() { return !!this.currentUser(); },
    isStaff() { const u = this.currentUser(); return !!u && (u.role === "Admin" || u.role === "Petugas"); },
    isPemohon() { const u = this.currentUser(); return !!u && u.role === "Pemohon"; },
    displayName() { const u = this.currentUser(); return u ? u.name : "Pengguna"; },
    homeHash() { return this.isStaff() ? "#/admin/dashboard" : "#/saya/dashboard"; },

    setSession(userId) { sessionStorage.setItem(SESSION_KEY, userId); },

    logout(showConfirm) {
      function doLogout() {
        sessionStorage.removeItem(SESSION_KEY);
        if (App.Layout && App.Layout.destroy) App.Layout.destroy();
        if (App.Public && App.Public.destroy) App.Public.destroy();
        location.hash = "#/beranda";
        App.App.render();
        App.toast("Berhasil", "Anda telah keluar dari akun SIRADA BBWS.", "success");
      }
      if (showConfirm === false) return doLogout();
      App.confirm("Keluar dari akun", "Anda akan keluar dari SIRADA BBWS. Lanjutkan?", doLogout, { confirmText: "Ya, logout" });
    },

    async login(email, password) {
      const user = App.Store.get().users.find(function (u) { return u.email.toLowerCase() === String(email).trim().toLowerCase(); });
      if (!user) return { ok: false, error: "Email tidak terdaftar. Silakan daftar terlebih dahulu." };
      if (user.status !== "Aktif") return { ok: false, error: "Akun Anda nonaktif. Hubungi administrator BBWS." };
      const hash = await this.hash(password);
      if (user.passwordHash !== hash) return { ok: false, error: "Password salah. Silakan coba lagi." };
      this.setSession(user.id);
      return { ok: true, user };
    },

    async register(data) {
      const state = App.Store.get();
      const email = String(data.email).trim().toLowerCase();
      if (state.users.some(function (u) { return u.email.toLowerCase() === email; })) {
        return { ok: false, error: "Email tersebut sudah terdaftar. Gunakan email lain atau login." };
      }
      if (data.password !== data.confirm) return { ok: false, error: "Konfirmasi password tidak sesuai." };
      if (data.password.length < 8) return { ok: false, error: "Password minimal 8 karakter." };
      const user = {
        id: App.Store.uid("USR"),
        name: data.name, email, passwordHash: await this.hash(data.password),
        role: "Pemohon", applicantType: data.applicantType, institution: data.institution || "-",
        phone: data.phone, nik: "-", address: "-",
        registeredAt: new Date().toISOString(), status: "Aktif"
      };
      App.Store.update(function (s) {
        s.users.push(user);
        App.Store.notify(s, user.id, "Akun berhasil dibuat", "Selamat datang di SIRADA BBWS. Silakan login untuk mengajukan permohonan data.", "success");
        App.Store.log(s, "Pengguna", "Pendaftaran akun baru: " + user.name, user.name);
      });
      return { ok: true, user };
    },

    requestReset(email) {
      const user = App.Store.get().users.find(function (u) { return u.email.toLowerCase() === String(email).trim().toLowerCase(); });
      if (!user) return { ok: false, error: "Email tidak ditemukan dalam sistem." };
      return { ok: true, user };
    },

    rememberReturn(hash) {
      if (hash) sessionStorage.setItem(RETURN_KEY, hash);
    },
    consumeReturn() {
      const value = sessionStorage.getItem(RETURN_KEY) || this.homeHash();
      sessionStorage.removeItem(RETURN_KEY);
      return value;
    },

    /* ------------------------------ Public shell ----------------------------- */
    publicLinks() {
      return [
        { route: "beranda", label: "Beranda", hash: "#/beranda" },
        { route: "tentang", label: "Tentang SIRADA", hash: "#/tentang" },
        { route: "katalog", label: "Katalog Data", hash: "#/katalog" },
        { route: "panduan", label: "Panduan", hash: "#/panduan" },
        { route: "faq", label: "FAQ", hash: "#/faq" }
      ];
    },

    mountShell() {
      const app = document.getElementById("app");
      if (app.querySelector(".public-shell")) return;
      const loggedIn = this.isLoggedIn();
      app.innerHTML =
        '<div class="public-shell">' +
          '<header class="pub-header" id="pub-header">' +
            '<div class="pub-container pub-header__inner">' +
              '<a class="pub-brand" href="#/beranda">' +
                '<span class="pub-brand__mark">' + App.icon("layers") + "</span>" +
                '<span class="pub-brand__text"><strong>SIRADA<span>BBWS</span></strong><small>Bengawan Solo</small></span>' +
              "</a>" +
              '<nav class="pub-nav" id="pub-nav">' +
                this.publicLinks().map(function (l) {
                  return '<a data-pub-route="' + l.route + '" href="' + l.hash + '">' + l.label + "</a>";
                }).join("") +
              "</nav>" +
              '<div class="pub-header__actions">' +
                (loggedIn
                  ? '<a class="btn btn--primary btn--sm" href="' + this.homeHash() + '">' + App.icon("grid") + "Dashboard Saya</a>"
                  : '<a class="btn btn--ghost-light btn--sm" href="#/login">Masuk</a><a class="btn btn--primary btn--sm" href="#/register">Daftar</a>') +
                '<button class="pub-menu-toggle" id="pub-menu-toggle" type="button" aria-label="Buka menu">' + App.icon("menu") + "</button>" +
              "</div>" +
            "</div>" +
          "</header>" +
          '<main id="public-content" class="pub-main"></main>' +
          '<footer class="pub-footer">' +
            '<div class="pub-container pub-footer__grid">' +
              "<div><div class=\"pub-brand pub-brand--footer\"><span class=\"pub-brand__mark\">" + App.icon("layers") + "</span>" +
                '<span class="pub-brand__text"><strong>SIRADA<span>BBWS</span></strong><small>Bengawan Solo</small></span></div>' +
                "<p>Sistem Informasi Permohonan Data Balai Besar Wilayah Sungai Bengawan Solo. Melayani pengajuan data secara digital, transparan, dan terstruktur.</p></div>" +
              "<div><h4>Tautan</h4>" + this.publicLinks().map(function (l) {
                return '<a href="' + l.hash + '">' + l.label + "</a>";
              }).join("") + "</div>" +
              "<div><h4>Layanan</h4><a href=\"#/register\">Buat Akun</a><a href=\"#/login\">Masuk Sistem</a><a href=\"#/panduan\">Alur Permohonan</a><a href=\"#/faq\">Pertanyaan Umum</a></div>" +
              "<div><h4>Kontak</h4><p>" + App.icon("mapPin") + "  Jl. Proyek Bengawan Solo, No.1, Pabelan</p><p>" + App.icon("phone") + " (0271) 000-0000</p><p>" + App.icon("mail") + " layanan.data@bbwssolo.go.id</p></div>" +
            "</div>" +
            '<div class="pub-container pub-footer__bottom"><span>© 2026 BBWS Bengawan Solo · SIRADA v1.0</span><span>Dokumen ini merupakan simulasi antarmuka untuk keperluan perancangan.</span></div>' +
          "</footer>" +
        "</div>";

      const toggle = document.getElementById("pub-menu-toggle");
      toggle.addEventListener("click", function () {
        document.getElementById("pub-nav").classList.toggle("open");
      });
      document.querySelectorAll("#pub-nav a").forEach(function (a) {
        a.addEventListener("click", function () { document.getElementById("pub-nav").classList.remove("open"); });
      });
      this.setActivePublic(App.App.parseRoute().route);
    },

    destroy() {
      const nav = document.getElementById("pub-nav");
      if (nav) nav.classList.remove("open");
    },

    setActivePublic(route) {
      document.querySelectorAll("[data-pub-route]").forEach(function (a) {
        a.classList.toggle("active", a.dataset.pubRoute === route);
      });
    },

    setContent(html) {
      const root = document.getElementById("public-content");
      if (root) root.innerHTML = html;
    },

    /* ------------------------------- Pages ---------------------------------- */
    Pages: {},

    render(route, param) {
      this.mountShell();
      this.setActivePublic(route);
      const page = this.Pages[route] || this.Pages.beranda;
      this.setContent(page.render(param));
      if (page.mount) page.mount(document.getElementById("public-content"), param);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  /* ------------------------------- Beranda ---------------------------------- */
  App.Auth.Pages.beranda = {
    title: "Beranda",
    render() {
      const state = App.Store.get();
      const cats = state.categories.filter(function (c) { return c.active; }).slice(0, 4);
      const steps = [
        { icon: "user", title: "Buat Akun", text: "Daftar sebagai pemohon dengan data identitas yang valid." },
        { icon: "clipboard", title: "Isi Permohonan", text: "Pilih kategori data, jelaskan kebutuhan, dan unggah dokumen." },
        { icon: "eye", title: "Pantau Status", text: "Ikuti perkembangan permohonan melalui timeline status." },
        { icon: "download", title: "Unduh Data", text: "Data hasil dapat diunduh setelah petugas menyelesaikannya." }
      ];
      return '<section class="hero">' +
          '<div class="hero__glow hero__glow--one"></div><div class="hero__glow hero__glow--two"></div>' +
          '<div class="pub-container hero__inner">' +
            '<div class="hero__copy">' +
              '<span class="pub-eyebrow">' + App.icon("shieldCheck") + "LAYANAN DIGITAL RESMI BBWS</span>" +
              '<h1>Permohonan Data <span>Bengawan Solo</span>, Lebih Mudah &amp; Transparan.</h1>' +
              '<p>Ajukan permohonan data sumber daya air, unggah dokumen persyaratan, dan pantau status pengajuan Anda secara real-time dalam satu sistem terintegrasi.</p>' +
              '<div class="hero__actions">' +
                '<a class="btn btn--primary btn--lg" href="#/register">' + App.icon("plus") + "Ajukan Permohonan" + App.icon("arrowRight") + "</a>" +
                '<a class="btn btn--outline btn--lg" href="#/katalog">' + App.icon("folder") + "Lihat Katalog Data</a>" +
              "</div>" +
              '<div class="hero__trust"><span>' + App.icon("checkCircle") + "Tanpa antrean fisik</span><span>" + App.icon("checkCircle") + "Status dapat dipantau</span><span>" + App.icon("checkCircle") + "Dokumen terpusat</span></div>" +
            "</div>" +
            '<div class="hero__visual">' +
              '<img class="hero__image" data-hero-image src="assets/hero-sirada.png" alt="Ilustrasi layanan data SIRADA BBWS">' +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="pub-section pub-container">' +
          '<div class="pub-section__head"><span class="pub-eyebrow pub-eyebrow--dark">KEUNGGULAN</span><h2>Mengapa menggunakan SIRADA?</h2><p>Dirancang untuk mempermudah layanan data bagi masyarakat, peneliti, dan instansi.</p></div>' +
          '<div class="feature-grid">' +
            feature("search", "Mudah Dilacak", "Nomor tiket unik dan riwayat status membuat setiap pengajuan dapat dipantau.") +
            feature("folder", "Dokumen Terpusat", "Surat permohonan, dokumen pendukung, dan data hasil tersimpan rapi.") +
            feature("shield", "Akses Terkendali", "Hak akses berdasarkan peran menjaga kerahasiaan data pemohon.") +
            feature("activity", "Transparan", "Setiap perubahan status dicatat dan disampaikan sebagai notifikasi.") +
          "</div>" +
        "</section>" +

        '<section class="pub-section pub-section--soft">' +
          '<div class="pub-container"><div class="pub-section__head"><span class="pub-eyebrow pub-eyebrow--dark">ALUR LAYANAN</span><h2>Empat langkah untuk mendapatkan data</h2><p>Proses pengajuan yang jelas dari awal hingga data diterima.</p></div>' +
          '<div class="steps-grid">' + steps.map(function (s, i) {
            return '<div class="step-card"><span class="step-card__num">0' + (i + 1) + "</span><span class=\"step-card__icon\">" + App.icon(s.icon) + "</span><h3>" + s.title + "</h3><p>" + s.text + "</p></div>";
          }).join("") + "</div></div>" +
        "</section>" +

        '<section class="pub-section pub-container">' +
          '<div class="pub-section__head pub-section__head--row"><div><span class="pub-eyebrow pub-eyebrow--dark">KATEGORI DATA</span><h2>Data yang dapat dimohonkan</h2></div><a class="btn btn--outline btn--sm" href="#/katalog">Lihat semua kategori ' + App.icon("arrowRight") + "</a></div>" +
          '<div class="catalog-grid">' + cats.map(catalogCard).join("") + "</div>" +
        "</section>" +

        '<section class="pub-container pub-cta"><div class="pub-cta__inner"><div><span class="pub-eyebrow">MULAI SEKARANG</span><h2>Siap mengajukan permohonan data?</h2><p>Buat akun pemohon dan nikmati proses permohonan yang lebih tertata.</p></div><div class="pub-cta__actions"><a class="btn btn--yellow btn--lg" href="#/register">Buat Akun Pemohon</a><a class="btn btn--outline btn--lg" href="#/panduan">Baca Panduan</a></div></div></section>';
    },
    mount(root) {
      const img = root.querySelector("[data-hero-image]");
      if (!img) return;
      const hide = function () { img.classList.add("is-missing"); };
      img.addEventListener("error", hide);
      if (img.complete && img.naturalWidth === 0) hide();
    }
  };

  function feature(icon, title, text) {
    return '<div class="feature-card"><span class="feature-card__icon">' + App.icon(icon) + "</span><h3>" + title + "</h3><p>" + text + "</p></div>";
  }

  function catalogCard(c) {
    const used = App.Store.get().requests.filter(function (r) { return r.categoryId === c.id; }).length;
    return '<article class="catalog-card"><span class="catalog-card__icon">' + App.icon(c.icon || "folder") + "</span>" +
      '<span class="catalog-card__code">' + App.h(c.code) + "</span>" +
      "<h3>" + App.h(c.name) + "</h3><p>" + App.h(c.description) + "</p>" +
      '<div class="catalog-card__foot">' + App.badge(c.availability, c.availability === "Tersedia" ? "green" : c.availability === "Terbatas" ? "red" : "amber") +
      '<span>' + used + " permohonan</span></div>" +
      '<button class="catalog-card__link" type="button" data-cat="' + App.h(c.id) + '">Detail kategori ' + App.icon("arrowRight") + "</button></article>";
  }

  function bindCatalogCards(root) {
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () { showCategory(b.dataset.cat); });
    });
  }

  function showCategory(id) {
    const c = App.Store.get().categories.find(function (x) { return x.id === id; });
    if (!c) return;
    App.modal({
      title: c.name,
      subtitle: "Kode kategori: " + c.code,
      confirmText: "Ajukan Data Ini",
      cancelText: "Tutup",
      body: '<p class="modal__message">' + App.h(c.description) + "</p>" +
        '<div class="info-grid" style="margin-top:16px">' +
          '<div class="info-item"><label>Informasi data</label><div>' + App.h(c.info || "-") + "</div></div>" +
          '<div class="info-item"><label>Ketersediaan</label><div>' + App.badge(c.availability) + "</div></div>" +
          '<div class="info-item"><label>Status kategori</label><div>' + App.badge(c.active ? "Aktif" : "Nonaktif") + "</div></div>" +
        "</div>" +
        '<div class="note-box" style="margin-top:16px"><strong>Syarat umum:</strong><p style="margin:5px 0 0">Surat permohonan bermeterai, identitas pemohon, dan penjelasan tujuan penggunaan data.</p></div>',
      onConfirm() {
        if (!App.Auth.isLoggedIn()) {
          App.Auth.rememberReturn("#/saya/baru?kategori=" + encodeURIComponent(c.id));
          location.hash = "#/login";
          App.toast("Login diperlukan", "Silakan masuk terlebih dahulu untuk mengajukan permohonan.", "info");
          return;
        }
        location.hash = "#/saya/baru?kategori=" + encodeURIComponent(c.id);
      }
    });
  }
  App.Auth.showCategory = showCategory;

  /* -------------------------------- Tentang --------------------------------- */
  App.Auth.Pages.tentang = {
    title: "Tentang SIRADA",
    render() {
      return '<section class="pub-page-head"><div class="pub-container"><span class="pub-eyebrow">TENTANG KAMI</span><h1>Tentang SIRADA BBWS</h1><p>Informasi mengenai sistem, instansi, dan tujuan layanan permohonan data.</p></div></section>' +
        '<section class="pub-section pub-container"><div class="about-grid">' +
          '<div class="about-illustration"><div class="about-illustration__circle">' + App.icon("layers") + "</div><span class=\"about-illustration__chip about-illustration__chip--one\">Transparan</span><span class=\"about-illustration__chip about-illustration__chip--two\">Terstruktur</span><span class=\"about-illustration__chip about-illustration__chip--three\">Modern</span></div>" +
          "<div><h2>Sistem Informasi Permohonan Data BBWS Bengawan Solo</h2>" +
          "<p>Balai Besar Wilayah Sungai Bengawan Solo memiliki beragam data terkait pengelolaan sumber daya air. SIRADA hadir sebagai sarana digital untuk menyatukan alur pengajuan, verifikasi, pengelolaan dokumen, hingga penyampaian data kepada pemohon.</p>" +
          "<p>Sistem ini ditujukan bagi masyarakat umum, mahasiswa, peneliti, instansi pemerintah, lembaga pendidikan, maupun organisasi yang membutuhkan data dari BBWS Bengawan Solo.</p>" +
          '<div class="vision-box"><strong>' + App.icon("sparkles") + "Visi Produk</strong><p>Menjadi platform pelayanan permohonan data berbasis digital yang efektif, transparan, terstruktur, dan mudah digunakan di lingkungan BBWS Bengawan Solo.</p></div></div>" +
        "</div></section>" +
        '<section class="pub-section pub-section--soft"><div class="pub-container"><div class="pub-section__head"><h2>Nilai yang kami junjung</h2></div><div class="feature-grid">' +
          feature("shieldCheck", "Profesional", "Setiap permohonan ditangani dengan prosedur dan tanggung jawab yang jelas.") +
          feature("activity", "Transparansi", "Status dan riwayat perubahan dapat diakses oleh pemohon kapan saja.") +
          feature("users", "Inklusif", "Layanan terbuka untuk seluruh pemangku kepentingan di wilayah Bengawan Solo.") +
          feature("clock", "Efisien", "Mengurangi proses manual dan mempercepat komunikasi pemohon dengan petugas.") +
        "</div></div></section>";
    }
  };

  /* -------------------------------- Katalog --------------------------------- */
  App.Auth.Pages.katalog = {
    title: "Katalog Data",
    render() {
      const state = App.Store.get();
      return '<section class="pub-page-head"><div class="pub-container"><span class="pub-eyebrow">KATALOG DATA</span><h1>Kategori Data yang Tersedia</h1><p>Jelajahi kategori data yang dapat diajukan melalui SIRADA BBWS.</p></div></section>' +
        '<section class="pub-section pub-container"><div class="catalog-toolbar">' +
          '<div class="input-group">' + App.icon("search", "input-group__icon") + '<input class="input" id="catalog-q" type="search" placeholder="Cari kategori data…"></div>' +
          '<span class="catalog-toolbar__count" id="catalog-count">' + state.categories.length + " kategori</span></div>" +
          '<div class="catalog-grid" id="catalog-grid">' + state.categories.map(catalogCard).join("") + "</div>" +
          '<div id="catalog-empty"></div></section>';
    },
    mount(root) {
      bindCatalogCards(root);
      const input = root.querySelector("#catalog-q");
      input.addEventListener("input", App.debounce(function (e) {
        const q = e.target.value.trim().toLowerCase();
        const rows = App.Store.get().categories.filter(function (c) {
          return [c.name, c.code, c.description].join(" ").toLowerCase().indexOf(q) !== -1;
        });
        root.querySelector("#catalog-grid").innerHTML = rows.map(catalogCard).join("");
        root.querySelector("#catalog-count").textContent = rows.length + " kategori";
        root.querySelector("#catalog-empty").innerHTML = rows.length ? "" : App.empty("Kategori tidak ditemukan", "Coba kata kunci lain.", "search");
        bindCatalogCards(root);
      }, 200));
    }
  };

  /* -------------------------------- Panduan --------------------------------- */
  App.Auth.Pages.panduan = {
    title: "Panduan Permohonan",
    render() {
      const steps = [
        { icon: "user", title: "Registrasi Akun", text: "Isi data diri dengan lengkap pada halaman Daftar. Pastikan email aktif karena akan digunakan untuk login dan notifikasi." },
        { icon: "clipboard", title: "Buat Permohonan", text: "Pilih kategori data, isi judul, data yang dibutuhkan, tujuan penggunaan, serta tanggal kebutuhan data." },
        { icon: "upload", title: "Unggah Dokumen", text: "Lampirkan surat permohonan bermeterai dan dokumen pendukung berformat PDF, DOC, DOCX, JPG, atau PNG (maks. 10 MB per file)." },
        { icon: "send", title: "Kirim & Catat Tiket", text: "Periksa kembali isian, lalu kirim. Sistem akan menerbitkan nomor tiket unik yang dapat digunakan untuk memantau pengajuan." },
        { icon: "eye", title: "Pantau Status", text: "Buka menu Permohonan Saya untuk melihat timeline status, catatan petugas, dan dokumen yang perlu diperbaiki." },
        { icon: "download", title: "Unduh Data Hasil", text: "Setelah status Selesai, file hasil tersedia pada detail permohonan dan dapat diunduh kapan saja." }
      ];
      const statusRows = App.Store.get().statusCatalog.map(function (s) {
        return "<tr><td>" + App.statusBadge(s.name) + "</td><td>" + App.h(s.description) + "</td></tr>";
      }).join("");
      return '<section class="pub-page-head"><div class="pub-container"><span class="pub-eyebrow">PANDUAN</span><h1>Panduan Pengajuan Permohonan</h1><p>Ikuti langkah berikut agar permohonan Anda diproses lebih cepat.</p></div></section>' +
        '<section class="pub-section pub-container"><div class="guide-grid">' + steps.map(function (s, i) {
          return '<div class="guide-item"><span class="guide-item__num">' + (i + 1) + "</span><span class=\"guide-item__icon\">" + App.icon(s.icon) + "</span><div><h3>" + s.title + "</h3><p>" + s.text + "</p></div></div>";
        }).join("") + "</div></section>" +
        '<section class="pub-section pub-section--soft"><div class="pub-container guide-lower">' +
          '<div class="card"><div class="card__head"><h3>Dokumen yang Disiapkan</h3></div><div class="card__body"><ul class="check-list">' +
            '<li>' + App.icon("checkCircle") + "Surat permohonan bermeterai yang ditujukan kepada Kepala BBWS Bengawan Solo</li>" +
            '<li>' + App.icon("checkCircle") + "Fotokopi identitas yang masih berlaku (KTP/SIM/KTM bagi mahasiswa)</li>" +
            '<li>' + App.icon("checkCircle") + "Surat keterangan dari instansi/lembaga (jika mengajukan atas nama organisasi)</li>" +
            '<li>' + App.icon("checkCircle") + "Penjelasan tujuan penggunaan data yang spesifik</li>" +
          "</ul></div></div>" +
          '<div class="card"><div class="card__head"><h3>Status Permohonan</h3></div><div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr><th>Status</th><th>Keterangan</th></tr></thead><tbody>' + statusRows + "</tbody></table></div></div></div>" +
        "</div></section>" +
        '<section class="pub-container pub-cta"><div class="pub-cta__inner"><div><h2>Siap mengajukan permohonan?</h2><p>Pastikan dokumen Anda telah lengkap sebelum mengirim.</p></div><a class="btn btn--yellow btn--lg" href="#/register">Buat Akun Sekarang</a></div></section>';
    }
  };

  /* ---------------------------------- FAQ ----------------------------------- */
  App.Auth.Pages.faq = {
    title: "FAQ",
    render() {
      const faqs = [
        ["Siapa yang dapat mengajukan permohonan data?", "Masyarakat umum, mahasiswa, peneliti, instansi pemerintah, lembaga pendidikan, dan organisasi dapat mengajukan permohonan setelah memiliki akun pemohon."],
        ["Apakah katalog data dapat dilihat tanpa akun?", "Ya. Katalog data dapat diakses publik. Namun, untuk mengajukan permohonan Anda harus login terlebih dahulu."],
        ["Bagaimana cara mengetahui status permohonan?", "Masuk ke dashboard, buka menu Permohonan Saya, lalu pilih permohonan. Setiap perubahan status tampil pada timeline dan notifikasi."],
        ["Apakah semua data dapat diberikan?", "Tidak. Sebagian data bersifat terbatas dan memerlukan persetujuan tambahan sesuai kebijakan BBWS Bengawan Solo."],
        ["Apakah surat permohonan wajib bermeterai?", "Ya, surat permohonan sebaiknya bermeterai dan ditujukan kepada Kepala BBWS Bengawan Solo. Petugas dapat meminta perbaikan bila tidak memenuhi syarat."],
        ["Berapa lama permohonan diproses?", "Waktu pemrosesan tergantung kompleksitas dan ketersediaan data. Status terkini selalu dapat dipantau melalui sistem."],
        ["Bagaimana jika dokumen saya ditolak?", "Petugas akan memberikan catatan perbaikan. Perbaiki dokumen, unggah kembali pada halaman detail permohonan, lalu status akan diperiksa ulang."],
        ["Bagaimana cara mengunduh data hasil?", "Setelah status berubah menjadi Selesai, buka detail permohonan dan klik tombol unduh pada bagian Data Hasil."]
      ];
      return '<section class="pub-page-head"><div class="pub-container"><span class="pub-eyebrow">BANTUAN</span><h1>Pertanyaan yang Sering Diajukan</h1><p>Temukan jawaban atas pertanyaan umum seputar layanan permohonan data.</p></div></section>' +
        '<section class="pub-section pub-container"><div class="faq-layout"><div class="faq-list">' + faqs.map(function (f, i) {
          return '<div class="faq-item' + (i === 0 ? " open" : "") + '"><button type="button" class="faq-item__q"><span>' + App.h(f[0]) + "</span>" + App.icon("chevron") + "</button>" +
            '<div class="faq-item__a"><p>' + App.h(f[1]) + "</p></div></div>";
        }).join("") + "</div>" +
          '<div class="faq-help"><span class="faq-help__icon">' + App.icon("helpCircle") + "</span><h3>Masih membutuhkan bantuan?</h3><p>Hubungi layanan data BBWS Bengawan Solo melalui email atau telepon pada jam kerja.</p><a class=\"btn btn--primary btn--block\" href=\"mailto:layanan.data@bbwssolo.go.id\">" + App.icon("mail") + "Email Layanan Data</a></div></div></section>";
    },
    mount(root) {
      root.querySelectorAll(".faq-item__q").forEach(function (btn) {
        btn.addEventListener("click", function () { btn.parentElement.classList.toggle("open"); });
      });
    }
  };

  /* --------------------------------- Login ---------------------------------- */
  App.Auth.Pages.login = {
    title: "Masuk",
    render() {
      if (App.Auth.isLoggedIn()) {
        return '<section class="auth-section"><div class="auth-card auth-card--notice"><div class="auth-card__icon">' + App.icon("checkCircle") + "</div><h2>Anda sudah masuk</h2><p>Sedang menggunakan akun " + App.h(App.Auth.currentUser().email) + ".</p><a class=\"btn btn--primary btn--block\" href=\"" + App.Auth.homeHash() + "\">Buka Dashboard</a></div></section>";
      }
      return '<section class="auth-section"><div class="auth-card">' +
        '<div class="auth-card__head"><span class="pub-eyebrow pub-eyebrow--dark">SELAMAT DATANG KEMBALI</span><h1>Masuk ke SIRADA BBWS</h1><p>Gunakan email dan password yang telah Anda daftarkan.</p></div>' +
        '<form id="login-form" class="auth-form" novalidate>' +
          '<div class="field"><label for="login-email">Alamat Email <span class="required">*</span></label><div class="input-group">' + App.icon("mail", "input-group__icon") + '<input class="input" id="login-email" type="email" autocomplete="email" placeholder="nama@example.com"></div></div>' +
          '<div class="field"><div class="field__row"><label for="login-password">Password <span class="required">*</span></label><a href="#/lupa-password">Lupa password?</a></div><div class="input-group">' + App.icon("lock", "input-group__icon") + '<input class="input" id="login-password" type="password" autocomplete="current-password" placeholder="Masukkan password"><button class="input-group__btn" id="toggle-password" type="button" aria-label="Tampilkan password">' + App.icon("eye") + "</button></div></div>" +
          '<div class="form-error" id="login-error"></div>' +
          '<button class="btn btn--primary btn--block btn--lg" type="submit">' + App.icon("logoutCircle") + "Masuk Sekarang</button>" +
        "</form>" +
        '<div class="auth-demo"><strong>Akun demo untuk simulasi:</strong><button type="button" data-demo="admin@bbwssolo.go.id|admin123">Admin / Petugas · admin@bbwssolo.go.id · admin123</button><button type="button" data-demo="siti.rahmawati@example.com|pemohon123">Pemohon · siti.rahmawati@example.com · pemohon123</button></div>' +
        '<p class="auth-switch">Belum memiliki akun? <a href="#/register">Daftar sekarang</a></p>' +
        "</div></section>";
    },
    mount(root) {
      const form = root.querySelector("#login-form");
      const toggle = root.querySelector("#toggle-password");
      if (!form || !toggle) return;
      toggle.addEventListener("click", function () {
        const input = root.querySelector("#login-password");
        input.type = input.type === "password" ? "text" : "password";
        toggle.innerHTML = App.icon(input.type === "password" ? "eye" : "eyeOff");
      });
      root.querySelectorAll("[data-demo]").forEach(function (b) {
        b.addEventListener("click", function () {
          const parts = b.dataset.demo.split("|");
          root.querySelector("#login-email").value = parts[0];
          root.querySelector("#login-password").value = parts[1];
          root.querySelector("#login-error").textContent = "";
        });
      });
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = root.querySelector("#login-email").value.trim();
        const password = root.querySelector("#login-password").value;
        const err = root.querySelector("#login-error");
        if (!email || !password) { err.textContent = "Email dan password wajib diisi."; return; }
        if (!App.validEmail(email)) { err.textContent = "Format email tidak valid."; return; }
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true; btn.textContent = "Memeriksa…";
        const result = await App.Auth.login(email, password);
        btn.disabled = false; btn.innerHTML = App.icon("logoutCircle") + "Masuk Sekarang";
        if (!result.ok) { err.textContent = result.error; return; }
        App.toast("Berhasil", "Selamat datang, " + result.user.name + ".", "success");
        location.hash = App.Auth.consumeReturn();
        App.App.render();
      });
    }
  };

  /* -------------------------------- Register -------------------------------- */
  App.Auth.Pages.register = {
    title: "Daftar",
    render() {
      return '<section class="auth-section auth-section--wide"><div class="auth-card auth-card--wide">' +
        '<div class="auth-card__head"><span class="pub-eyebrow pub-eyebrow--dark">PENDAFTARAN PEMOHON</span><h1>Buat Akun SIRADA BBWS</h1><p>Daftar untuk mengajukan permohonan data dan memantau statusnya.</p></div>' +
        '<form id="register-form" class="auth-form" novalidate>' +
          '<div class="field"><label for="reg-name">Nama Lengkap <span class="required">*</span></label><input class="input" id="reg-name" placeholder="Sesuai identitas resmi" autocomplete="name"></div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="reg-email">Email <span class="required">*</span></label><input class="input" id="reg-email" type="email" placeholder="nama@example.com" autocomplete="email"></div>' +
            '<div class="field"><label for="reg-phone">Nomor Telepon <span class="required">*</span></label><input class="input" id="reg-phone" placeholder="08xxxxxxxxxx" autocomplete="tel"></div>' +
          "</div>" +
          '<div class="field-row">' +
            '<div class="field"><label for="reg-password">Password <span class="required">*</span></label><input class="input" id="reg-password" type="password" placeholder="Minimal 8 karakter" autocomplete="new-password"></div>' +
            '<div class="field"><label for="reg-confirm">Konfirmasi Password <span class="required">*</span></label><input class="input" id="reg-confirm" type="password" placeholder="Ulangi password" autocomplete="new-password"></div>' +
          "</div>" +
          '<div class="field-row">' +
            '<div class="field"><label for="reg-type">Jenis Pemohon <span class="required">*</span></label><select class="select" id="reg-type">' +
              ["Masyarakat Umum", "Mahasiswa", "Peneliti", "Instansi Pemerintah", "Lembaga Pendidikan", "Organisasi"].map(function (t) { return '<option value="' + t + '">' + t + "</option>"; }).join("") +
            "</select></div>" +
            '<div class="field" id="reg-institution-wrap" style="display:none"><label for="reg-institution">Nama Instansi <span class="required">*</span></label><input class="input" id="reg-institution" placeholder="Nama instansi/lembaga"></div>' +
          "</div>" +
          '<label class="checkbox-row"><input type="checkbox" id="reg-terms">Saya menyetujui penggunaan data sesuai ketentuan layanan BBWS Bengawan Solo.</label>' +
          '<div class="form-error" id="register-error"></div>' +
          '<button class="btn btn--primary btn--block btn--lg" type="submit">' + App.icon("user") + "Buat Akun</button>" +
        "</form>" +
        '<p class="auth-switch">Sudah memiliki akun? <a href="#/login">Masuk sekarang</a></p>' +
        "</div></section>";
    },
    mount(root) {
      const type = root.querySelector("#reg-type");
      const wrap = root.querySelector("#reg-institution-wrap");
      function toggleInstitution() {
        const need = type.value !== "Masyarakat Umum";
        wrap.style.display = need ? "block" : "none";
        root.querySelector("#reg-institution").required = need;
      }
      type.addEventListener("change", toggleInstitution);
      toggleInstitution();

      root.querySelector("#register-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const get = function (id) { return root.querySelector(id).value.trim(); };
        const data = {
          name: get("#reg-name"), email: get("#reg-email"), phone: get("#reg-phone"),
          password: root.querySelector("#reg-password").value,
          confirm: root.querySelector("#reg-confirm").value,
          applicantType: type.value, institution: get("#reg-institution")
        };
        const err = root.querySelector("#register-error");
        if (!data.name || !data.email || !data.phone || !data.password) { err.textContent = "Lengkapi seluruh kolom wajib diisi."; return; }
        if (!App.validEmail(data.email)) { err.textContent = "Format email tidak valid."; return; }
        if (!/^[0-9+\-\s()]{8,20}$/.test(data.phone)) { err.textContent = "Nomor telepon tidak valid."; return; }
        if (data.applicantType !== "Masyarakat Umum" && !data.institution) { err.textContent = "Nama instansi wajib diisi untuk jenis pemohon ini."; return; }
        if (!root.querySelector("#reg-terms").checked) { err.textContent = "Anda harus menyetujui ketentuan layanan."; return; }
        const btn = root.querySelector("#register-form button[type=submit]");
        btn.disabled = true; btn.textContent = "Membuat akun…";
        const result = await App.Auth.register(data);
        btn.disabled = false; btn.innerHTML = App.icon("user") + "Buat Akun";
        if (!result.ok) { err.textContent = result.error; return; }
        App.toast("Registrasi berhasil", "Akun pemohon berhasil dibuat. Silakan masuk dengan email Anda.", "success");
        location.hash = "#/login";
        App.App.render();
      });
    }
  };

  /* ---------------------------- Lupa password ------------------------------- */
  App.Auth.Pages["lupa-password"] = {
    title: "Lupa Password",
    render() {
      return '<section class="auth-section"><div class="auth-card">' +
        '<div class="auth-card__head"><span class="auth-card__icon">' + App.icon("key") + "</span><h1>Pulihkan Akun</h1><p>Masukkan email terdaftar. Pada simulasi ini, kredensial demo ditampilkan kembali di bawah.</p></div>" +
        '<form id="reset-form" class="auth-form" novalidate>' +
          '<div class="field"><label for="reset-email">Alamat Email <span class="required">*</span></label><div class="input-group">' + App.icon("mail", "input-group__icon") + '<input class="input" id="reset-email" type="email" placeholder="nama@example.com"></div></div>' +
          '<div class="form-error" id="reset-error"></div>' +
          '<button class="btn btn--primary btn--block btn--lg" type="submit">Kirim Instruksi Pemulihan</button>' +
        "</form>" +
        '<div id="reset-result"></div><p class="auth-switch"><a href="#/login">← Kembali ke halaman masuk</a></p>' +
        "</div></section>";
    },
    mount(root) {
      root.querySelector("#reset-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const email = root.querySelector("#reset-email").value.trim();
        const err = root.querySelector("#reset-error");
        if (!App.validEmail(email)) { err.textContent = "Masukkan alamat email yang valid."; return; }
        const result = App.Auth.requestReset(email);
        if (!result.ok) { err.textContent = result.error; return; }
        const demo = result.user.role === "Pemohon" ? "pemohon123" : "admin123";
        root.querySelector("#reset-result").innerHTML = '<div class="note-box note-box--green" style="margin-top:16px"><strong>Instruksi pemulihan (simulasi)</strong><p style="margin:5px 0 0">Email untuk <b>' + App.h(email) + '</b> telah dicatat. Password demo akun ini: <code>' + demo + '</code>.</p></div>';
        App.toast("Berhasil", "Instruksi pemulihan ditampilkan.", "success");
      });
    }
  };
})();
