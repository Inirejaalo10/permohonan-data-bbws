/* ==========================================================================
   pages/users.js — Manajemen pengguna (CRUD, search, filter role)
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  const ui = { q: "", role: "" };
  const roles = ["Admin", "Petugas", "Pemohon"];

  function formBody(u) {
    const x = u || {};
    return '<div class="field-row">' +
      '<div class="field"><label>Nama lengkap <span class="required">*</span></label><input class="input" id="usr-name" value="' + App.h(x.name || "") + '" placeholder="Nama pengguna"></div>' +
      '<div class="field"><label>Username <span class="required">*</span></label><input class="input" id="usr-username" value="' + App.h(x.username || "") + '" placeholder="username"></div>' +
      "</div>" +
      '<div class="field"><label>Email <span class="required">*</span></label><input class="input" id="usr-email" type="email" value="' + App.h(x.email || "") + '" placeholder="nama@example.com"></div>' +
      '<div class="field-row">' +
        '<div class="field"><label>Role <span class="required">*</span></label><select class="select" id="usr-role">' +
          roles.map(function (r) { return '<option value="' + r + '" ' + (x.role === r ? "selected" : "") + ">" + r + "</option>"; }).join("") +
        "</select></div>" +
        '<div class="field"><label>Status akun</label><select class="select" id="usr-status">' +
          '<option value="Aktif" ' + (x.status !== "Nonaktif" ? "selected" : "") + ">Aktif</option>" +
          '<option value="Nonaktif" ' + (x.status === "Nonaktif" ? "selected" : "") + ">Nonaktif</option>" +
        "</select></div>" +
      "</div>" +
      '<div class="note-box" style="margin:6px 0 12px"><strong>Password awal (simulasi):</strong> <code>pemohon123</code> untuk Pemohon, <code>admin123</code> untuk Admin/Petugas.</div>' +
      '<label class="checkbox-row"><input type="checkbox" id="usr-active"> Kirim email undangan (simulasi)</label>' +
      '<div class="form-error" id="usr-error"></div>';
  }

  App.Pages.users = {
    title: "Manajemen Pengguna",
    subtitle: "Kelola akun dan hak akses pengguna",

    render() {
      const state = App.Store.get();
      const q = ui.q.trim().toLowerCase();
      const rows = state.users.filter(function (u) {
        const matchQ = [u.name, u.email, u.username].join(" ").toLowerCase().indexOf(q) !== -1;
        const matchRole = !ui.role || u.role === ui.role;
        return matchQ && matchRole;
      });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Manajemen Pengguna</h2>' +
        "<p>" + state.users.length + " akun terdaftar · " + state.users.filter(function (u) { return u.status === "Aktif"; }).length + " aktif</p></div>" +
        '<div class="page-toolbar__actions"><button class="btn btn--primary" type="button" id="add-user">' +
          App.icon("plus") + "Tambah Pengguna</button></div></div>" +

        '<div class="card"><div class="filters" style="grid-template-columns:minmax(220px,1fr) minmax(160px,.5fr) auto">' +
          '<div class="field"><label>Cari pengguna</label><div class="input-group">' + App.icon("search", "input-group__icon") +
            '<input class="input" id="usr-q" type="search" placeholder="Nama, email, atau username…" value="' + App.h(ui.q) + '"></div></div>' +
          '<div class="field"><label>Filter role</label><select class="select" id="usr-role-filter"><option value="">Semua role</option>' +
            roles.map(function (r) { return '<option value="' + r + '" ' + (ui.role === r ? "selected" : "") + ">" + r + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>&nbsp;</label><button class="btn btn--outline" type="button" id="usr-reset">' + App.icon("refresh") + "Reset</button></div>" +
        "</div>" +
        '<div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>Nama</th><th>Email</th><th>Username</th><th>Role</th><th>Tanggal Registrasi</th><th>Status</th><th>Aksi</th>" +
          "</tr></thead><tbody>" +
          (rows.length ? rows.map(function (u, i) {
            return "<tr>" +
              '<td><div class="avatar-cell"><span class="avatar">' + App.h(u.name.split(" ").map(function (x) { return x[0]; }).slice(0, 2).join("")) + "</span>" +
              '<div><div class="table__primary">' + App.h(u.name) + '</div><div class="table__muted">' + App.h(u.id) + "</div></div></div></td>" +
              "<td>" + App.h(u.email) + "</td>" +
              '<td><span class="table__code">' + App.h(u.username || String(u.email || "").split("@")[0]) + "</span></td>" +
              "<td>" + App.badge(u.role) + "</td>" +
              "<td>" + App.fmtDate(u.registeredAt) + "</td>" +
              "<td>" + App.badge(u.status) + "</td>" +
              '<td><div class="table__actions">' +
                '<button class="icon-btn-table" type="button" data-edit-user="' + App.h(u.id) + '" title="Edit">' + App.icon("edit") + "</button>" +
                '<button class="icon-btn-table" type="button" data-toggle-user="' + App.h(u.id) + '" title="' + (u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan") + '">' +
                  App.icon(u.status === "Aktif" ? "lock" : "checkCircle") + "</button>" +
                '<button class="icon-btn-table icon-btn-table--danger" type="button" data-delete-user="' + App.h(u.id) + '" title="Hapus">' + App.icon("trash") + "</button>" +
              "</div></td></tr>";
          }).join("") : '<tr><td colspan="7">' + App.empty("Pengguna tidak ditemukan", "Ubah kata kunci atau filter role.", "users") + "</td></tr>") +
          "</tbody></table></div></div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.users.render());
        App.Pages.users.mount(document.getElementById("page-content"));
      }

      root.querySelector("#usr-q").addEventListener("input", App.debounce(function (e) { ui.q = e.target.value; rerender(); }, 240));
      root.querySelector("#usr-role-filter").addEventListener("change", function (e) { ui.role = e.target.value; rerender(); });
      root.querySelector("#usr-reset").addEventListener("click", function () { ui.q = ui.role = ""; rerender(); });

      function openForm(existing) {
        App.modal({
          title: existing ? "Edit Pengguna" : "Tambah Pengguna Baru",
          subtitle: existing ? existing.name : "Buat akun dan tentukan hak aksesnya",
          confirmText: existing ? "Simpan perubahan" : "Tambah pengguna",
          body: formBody(existing),
          onConfirm(modal) {
            const name = modal.querySelector("#usr-name").value.trim();
            const username = modal.querySelector("#usr-username").value.trim();
            const email = modal.querySelector("#usr-email").value.trim();
            const role = modal.querySelector("#usr-role").value;
            const status = modal.querySelector("#usr-status").value;
            const err = modal.querySelector("#usr-error");

            if (!name || !username || !email) { err.textContent = "Nama, username, dan email wajib diisi."; return false; }
            if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "Format email tidak valid."; return false; }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) { err.textContent = "Username hanya boleh huruf, angka, dan underscore."; return false; }

            const state = App.Store.get();
            const duplicate = state.users.some(function (u) {
              return ((u.email || "").toLowerCase() === email.toLowerCase() || (u.username || "").toLowerCase() === username.toLowerCase()) &&
                (!existing || u.id !== existing.id);
            });
            if (duplicate) { err.textContent = "Email atau username sudah digunakan pengguna lain."; return false; }

            const isPemohon = role === "Pemohon";
            App.Store.update(function (s) {
              if (existing) {
                const u = s.users.find(function (x) { return x.id === existing.id; });
                const roleChanged = u.role !== role;
                Object.assign(u, { name, username, email, role, status });
                if (roleChanged) u.passwordHash = isPemohon ? App.SEED_HASH.pemohon : App.SEED_HASH.admin;
                App.Store.log(s, "Pengguna", "Mengubah akun " + name);
              } else {
                s.users.push({
                  id: App.Store.uid("USR"), name, username, email, role, status,
                  passwordHash: isPemohon ? App.SEED_HASH.pemohon : App.SEED_HASH.admin,
                  applicantType: isPemohon ? "Masyarakat Umum" : "Instansi Pemerintah",
                  institution: isPemohon ? "-" : "BBWS Bengawan Solo",
                  phone: "-", nik: "-", address: "-",
                  registeredAt: new Date().toISOString()
                });
                App.Store.log(s, "Pengguna", "Menambahkan akun " + name);
              }
            });
            App.toast("Berhasil", existing ? "Data pengguna diperbarui." : "Pengguna baru ditambahkan.", "success");
            rerender();
          }
        });
      }

      root.querySelector("#add-user").addEventListener("click", function () { openForm(null); });
      root.querySelectorAll("[data-edit-user]").forEach(function (b) {
        b.addEventListener("click", function () {
          const u = App.Store.get().users.find(function (x) { return x.id === b.dataset.editUser; });
          if (u) openForm(u);
        });
      });
      root.querySelectorAll("[data-toggle-user]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.toggleUser;
          App.confirm("Ubah status akun", "Status akun akan diubah. Lanjutkan?", function () {
            let msg = "";
            App.Store.update(function (s) {
              const u = s.users.find(function (x) { return x.id === id; });
              u.status = u.status === "Aktif" ? "Nonaktif" : "Aktif";
              msg = u.name + " sekarang " + u.status;
              App.Store.log(s, "Pengguna", "Mengubah status akun " + u.name + " menjadi " + u.status);
            });
            App.toast("Berhasil", msg, "success");
            rerender();
          }, { confirmText: "Ya, ubah status" });
        });
      });
      root.querySelectorAll("[data-delete-user]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.deleteUser;
          const u = App.Store.get().users.find(function (x) { return x.id === id; });
          App.confirm("Hapus pengguna", "Akun " + (u ? u.name : id) + " akan dihapus permanen.", function () {
            App.Store.update(function (s) {
              s.users = s.users.filter(function (x) { return x.id !== id; });
              App.Store.log(s, "Pengguna", "Menghapus akun " + (u ? u.name : id));
            });
            App.toast("Berhasil", "Akun pengguna dihapus.", "success");
            rerender();
          }, { confirmText: "Ya, hapus" });
        });
      });
    }
  };
})();
