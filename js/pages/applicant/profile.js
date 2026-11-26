/* ==========================================================================
   applicant/profile.js — Profil dan pengelolaan data pemohon
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  const TYPES = ["Masyarakat Umum", "Mahasiswa", "Peneliti", "Instansi Pemerintah", "Lembaga Pendidikan", "Organisasi"];

  App.ApplicantPages.profil = {
    title: "Profil Saya",
    subtitle: "Kelola data identitas pemohon",

    render() {
      const user = App.Auth.currentUser();
      const total = App.Store.get().requests.filter(function (r) { return r.userId === user.id; }).length;

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Profil Pemohon</h2><p>Informasi identitas yang digunakan pada formulir permohonan.</p></div></div>' +
        '<div class="profile-grid">' +
          '<div class="card profile-card"><div class="profile-card__cover"></div><div class="card__body">' +
            '<div class="profile-card__avatar">' + App.h(App.initials(user.name)) + "</div>" +
            '<h3>' + App.h(user.name) + "</h3><p>" + App.h(user.role) + " · " + App.h(user.applicantType) + "</p>" +
            '<div class="profile-card__meta"><span>' + App.icon("mail") + App.h(user.email) + "</span><span>" + App.icon("phone") + App.h(user.phone || "-") + "</span><span>" + App.icon("building") + App.h(user.institution || "-") + "</span></div>" +
            '<div class="profile-card__stats"><div><strong>' + total + "</strong><span>Permohonan</span></div><div><strong>" + App.fmtDate(user.registeredAt) + "</strong><span>Bergabung</span></div></div>" +
          "</div></div>" +

          '<div class="card"><div class="card__head"><div><h3>Edit Profil</h3><p>Perbarui data jika terjadi perubahan identitas</p></div></div>' +
            '<div class="card__body"><form id="profile-form" novalidate>' +
              '<div class="field"><label for="pf-name">Nama Lengkap <span class="required">*</span></label><input class="input" id="pf-name" value="' + App.h(user.name) + '"></div>' +
              '<div class="field-row">' +
                '<div class="field"><label for="pf-type">Jenis Pemohon</label><select class="select" id="pf-type">' +
                  TYPES.map(function (t) { return '<option value="' + t + '" ' + (user.applicantType === t ? "selected" : "") + ">" + t + "</option>"; }).join("") + "</select></div>" +
                '<div class="field"><label for="pf-institution">Instansi</label><input class="input" id="pf-institution" value="' + App.h(user.institution && user.institution !== "-" ? user.institution : "") + '"></div>' +
              "</div>" +
              '<div class="field-row">' +
                '<div class="field"><label for="pf-phone">Nomor Telepon</label><input class="input" id="pf-phone" value="' + App.h(user.phone || "") + '"></div>' +
                '<div class="field"><label for="pf-nik">NIK / Nomor Identitas</label><input class="input" id="pf-nik" value="' + App.h(user.nik && user.nik !== "-" ? user.nik : "") + '"></div>' +
              "</div>" +
              '<div class="field"><label for="pf-address">Alamat</label><textarea class="textarea" id="pf-address">' + App.h(user.address && user.address !== "-" ? user.address : "") + "</textarea></div>" +
              '<div class="form-error" id="pf-error"></div>' +
              '<button class="btn btn--primary" type="submit">' + App.icon("save") + "Simpan Perubahan</button>" +
            "</form></div></div>" +
        "</div>";
    },

    mount(root) {
      root.querySelector("#profile-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const get = function (id) { return root.querySelector(id).value.trim(); };
        const err = root.querySelector("#pf-error");
        if (!get("#pf-name")) { err.textContent = "Nama lengkap wajib diisi."; return; }
        const type = get("#pf-type");
        if (type !== "Masyarakat Umum" && !get("#pf-institution")) { err.textContent = "Nama instansi wajib diisi untuk jenis pemohon ini."; return; }
        const user = App.Auth.currentUser();
        App.Store.update(function (s) {
          const u = s.users.find(function (x) { return x.id === user.id; });
          u.name = get("#pf-name"); u.applicantType = type;
          u.institution = get("#pf-institution") || "-"; u.phone = get("#pf-phone") || "-";
          u.nik = get("#pf-nik") || "-"; u.address = get("#pf-address") || "-";
          s.requests.forEach(function (r) { if (r.userId === u.id) { r.applicant = u.name; r.institution = u.institution; r.phone = u.phone; } });
          App.Store.log(s, "Profil", "Pemohon memperbarui profil", u.name);
        });
        // Perbarui nama di sidebar/topbar bila sudahtermount.
        if (document.querySelector(".profile-btn__meta strong")) document.querySelector(".profile-btn__meta strong").textContent = get("#pf-name");
        App.toast("Berhasil", "Profil pemohon berhasil diperbarui.", "success");
      });
    }
  };
})();
