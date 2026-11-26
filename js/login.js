/* ==========================================================================
   login.js — Simulasi sesi login/logout administrator
   ========================================================================== */
(function () {
  App.Login = {
    key: "spp-admin-session",

    isLoggedIn() {
      return sessionStorage.getItem(this.key) === "true";
    },

    show() {
      const app = document.getElementById("app");
      app.innerHTML =
        '<div class="login-page"><div class="login-card">' +
          '<div class="login-card__brand"><div class="brand__mark">' + App.icon("shield") + "</div>" +
            "<div><strong>Sistem Pengelolaan Permohonan</strong><span>Panel Administrator</span></div></div>" +
          '<h2 style="margin:0 0 6px;font-size:20px;color:var(--slate-900)">Masuk ke akun admin</h2>' +
          '<p style="margin:0 0 22px;font-size:12px;color:var(--slate-500)">Kelola dan verifikasi permohonan masuk.</p>' +
          '<form id="login-form">' +
            '<div class="field"><label>Username</label><input class="input" id="login-user" autocomplete="username" placeholder="admin"></div>' +
            '<div class="field"><label>Password</label><input class="input" id="login-pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>' +
            '<div class="form-error" id="login-error"></div>' +
            '<button class="btn btn--primary btn--block" type="submit">' + App.icon("lock") + "Masuk Dashboard</button>" +
          "</form>" +
          '<div class="login-hint">Akun demo: <code>admin</code> / <code>admin123</code></div>' +
        "</div></div>";

      document.getElementById("login-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("login-user").value.trim();
        const password = document.getElementById("login-pass").value;
        const err = document.getElementById("login-error");
        if (!username || !password) { err.textContent = "Username dan password wajib diisi."; return; }
        if (username !== "admin" || password !== "admin123") {
          err.textContent = "Kredensial tidak valid. Gunakan akun demo di bawah.";
          return;
        }
        sessionStorage.setItem(App.Login.key, "true");
        App.toast("Berhasil", "Selamat datang kembali, Admin Utama.", "success");
        App.App.start();
      });
    },

    logout() {
      App.confirm("Keluar dari akun", "Anda akan keluar dari panel administrator. Lanjutkan?", function () {
        sessionStorage.removeItem(App.Login.key);
        App.Layout.closeDropdowns();
        location.hash = "#/dashboard";
        App.Login.show();
      }, { confirmText: "Ya, logout" });
    }
  };
})();
