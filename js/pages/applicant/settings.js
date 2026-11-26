/* ==========================================================================
   applicant/settings.js — Pengaturan akun pemohon (password & preferensi)
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  App.ApplicantPages.settings = {
    title: "Pengaturan Akun",
    subtitle: "Ubah password dan preferensi",

    render() {
      const user = App.Auth.currentUser();
      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Pengaturan Akun</h2><p>Kelola keamanan akun dan preferensi notifikasi Anda.</p></div></div>' +
        '<div class="settings-grid">' +
          '<div class="card"><div class="card__head"><div><h3>Ubah Password</h3><p>Gunakan password minimal 8 karakter</p></div>' + App.icon("lock", "head-icon") + "</div>" +
            '<div class="card__body"><form id="password-form" novalidate>' +
              '<div class="field"><label for="ps-current">Password Saat Ini <span class="required">*</span></label><input class="input" id="ps-current" type="password" autocomplete="current-password"></div>' +
              '<div class="field"><label for="ps-new">Password Baru <span class="required">*</span></label><input class="input" id="ps-new" type="password" autocomplete="new-password"></div>' +
              '<div class="field"><label for="ps-confirm">Konfirmasi Password Baru <span class="required">*</span></label><input class="input" id="ps-confirm" type="password" autocomplete="new-password"></div>' +
              '<div class="form-error" id="ps-error"></div>' +
              '<button class="btn btn--primary" type="submit">' + App.icon("key") + "Perbarui Password</button>" +
            "</form></div></div>" +

          '<div style="display:flex;flex-direction:column;gap:18px">' +
            '<div class="card"><div class="card__head"><h3>Preferensi Notifikasi</h3></div><div class="card__body">' +
              '<label class="check-item"><input type="checkbox" checked><span><strong>Perubahan status permohonan</strong><span>Notifikasi saat status Diajukan hingga Selesai</span></span></label>' +
              '<label class="check-item"><input type="checkbox" checked><span><strong>Permintaan perbaikan</strong><span>Informasi bila petugas meminta dokumen tambahan</span></span></label>' +
              '<label class="check-item"><input type="checkbox"><span><strong>Ringkasan bulanan</strong><span>Ringkasan aktivitas permohonan tiap bulan</span></span></label>' +
              '<button class="btn btn--outline btn--block" type="button" id="save-pref">' + App.icon("save") + "Simpan Preferensi</button>" +
            "</div></div>" +
            '<div class="card"><div class="card__head"><h3>Informasi Akun</h3></div><div class="card__body"><div class="info-grid">' +
              '<div class="info-item"><label>Email</label><div>' + App.h(user.email) + "</div></div>" +
              '<div class="info-item"><label>Role</label><div>' + App.h(user.role) + "</div></div>" +
              '<div class="info-item"><label>Status akun</label><div>' + App.badge(user.status) + "</div></div>" +
              '<div class="info-item"><label>Terdaftar sejak</label><div>' + App.fmtDate(user.registeredAt) + "</div></div>" +
            "</div></div></div>" +
          "</div>" +
        "</div>";
    },

    mount(root) {
      root.querySelector("#password-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const get = function (id) { return root.querySelector(id).value; };
        const err = root.querySelector("#ps-error");
        const current = get("#ps-current"), next = get("#ps-new"), confirm = get("#ps-confirm");
        if (!current || !next || !confirm) { err.textContent = "Seluruh kolom wajib diisi."; return; }
        if (next.length < 8) { err.textContent = "Password baru minimal 8 karakter."; return; }
        if (next !== confirm) { err.textContent = "Konfirmasi password baru tidak sesuai."; return; }
        const hash = await App.Auth.hash(current);
        const user = App.Auth.currentUser();
        if (user.passwordHash !== hash) { err.textContent = "Password saat ini tidak sesuai."; return; }
        const newHash = await App.Auth.hash(next);
        App.Store.update(function (s) {
          s.users.find(function (u) { return u.id === user.id; }).passwordHash = newHash;
          App.Store.log(s, "Pengaturan", "Password akun diperbarui", user.name);
        });
        root.querySelector("#password-form").reset();
        App.toast("Berhasil", "Password berhasil diperbarui.", "success");
      });
      root.querySelector("#save-pref").addEventListener("click", function () {
        App.toast("Berhasil", "Preferensi notifikasi disimpan (simulasi).", "success");
      });
    }
  };
})();
