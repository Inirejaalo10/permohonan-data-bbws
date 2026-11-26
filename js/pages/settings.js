/* ==========================================================================
   pages/settings.js — Pengaturan akun administrator/petugas
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  App.Pages.settings = {
    title: "Pengaturan Akun",
    subtitle: "Kelola profil dan preferensi akun",

    render() {
      const user = App.Auth.currentUser();
      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Pengaturan Akun</h2><p>Informasi akun yang sedang digunakan pada panel administrasi.</p></div></div>' +
        '<div class="settings-grid">' +
          '<div class="card"><div class="card__head"><h3>Profil Petugas</h3></div><div class="card__body">' +
            '<div class="profile-mini"><span class="avatar avatar--xl">' + App.h(App.initials(user.name)) + "</span><div><h3>" + App.h(user.name) + "</h3><p>" + App.h(user.role) + " · " + App.h(user.institution || "BBWS Bengawan Solo") + "</p></div></div>" +
            '<div class="info-grid" style="margin-top:18px">' +
              '<div class="info-item"><label>Email</label><div>' + App.h(user.email) + "</div></div>" +
              '<div class="info-item"><label>Role</label><div>' + App.badge(user.role) + "</div></div>" +
              '<div class="info-item"><label>Status akun</label><div>' + App.badge(user.status) + "</div></div>" +
              '<div class="info-item"><label>Terdaftar sejak</label><div>' + App.fmtDate(user.registeredAt) + "</div></div>" +
            "</div></div></div>" +
          '<div class="card"><div class="card__head"><h3>Keamanan & Preferensi</h3></div><div class="card__body">' +
            '<label class="check-item"><input type="checkbox" checked><span><strong>Notifikasi permohonan baru</strong><span>Tampilkan pengingat pada dashboard</span></span></label>' +
            '<label class="check-item"><input type="checkbox" checked><span><strong>Catatan aktivitas</strong><span>Catat seluruh tindakan verifikasi dan upload</span></span></label>' +
            '<button class="btn btn--outline btn--block" type="button" id="admin-save-pref">' + App.icon("save") + "Simpan Preferensi</button>" +
            '<div class="divider"></div>' +
            '<a class="btn btn--outline btn--block" href="#/admin/activity">' + App.icon("history") + "Lihat Riwayat Aktivitas</a>" +
          "</div></div>" +
        "</div>";
    },

    mount(root) {
      root.querySelector("#admin-save-pref").addEventListener("click", function () {
        App.toast("Berhasil", "Preferensi akun disimpan (simulasi).", "success");
      });
    }
  };
})();
