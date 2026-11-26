/* ==========================================================================
   pages/categories.js — Manajemen kategori permohonan (CRUD + search)
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  const ui = { q: "" };

  function formBody(c) {
    const x = c || {};
    return '<div class="field-row">' +
      '<div class="field"><label>Nama kategori <span class="required">*</span></label>' +
        '<input class="input" id="cat-name" value="' + App.h(x.name || "") + '" placeholder="Contoh: Data Hidrologi"></div>' +
      '<div class="field"><label>Kode singkat <span class="required">*</span></label>' +
        '<input class="input" id="cat-code" maxlength="4" value="' + App.h(x.code || "") + '" placeholder="AKT"></div>' +
      "</div>" +
      '<div class="field"><label>Deskripsi</label><textarea class="textarea" id="cat-desc" placeholder="Jelaskan jenis permohonan…">' + App.h(x.description || "") + "</textarea></div>" +
      '<label class="checkbox-row"><input type="checkbox" id="cat-active" ' + (x.active !== false ? "checked" : "") + ">Kategori aktif</label>" +
      '<div class="form-error" id="cat-error"></div>';
  }

  App.Pages.categories = {
    title: "Manajemen Kategori Data",
    subtitle: "Kelola kategori jenis permohonan",

    render() {
      const state = App.Store.get();
      const q = ui.q.trim().toLowerCase();
      const rows = state.categories.filter(function (c) {
        return [c.name, c.code, c.description].join(" ").toLowerCase().indexOf(q) !== -1;
      });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Manajemen Kategori Data</h2>' +
        "<p>" + state.categories.length + " kategori terdaftar · " + state.categories.filter(function (c) { return c.active; }).length + " aktif</p></div>" +
        '<div class="page-toolbar__actions"><button class="btn btn--primary" type="button" id="add-category">' +
          App.icon("plus") + "Tambah Kategori</button></div></div>" +

        '<div class="card"><div class="filters" style="grid-template-columns:minmax(240px,1fr) auto">' +
          '<div class="field"><label>Cari kategori</label><div class="input-group">' + App.icon("search", "input-group__icon") +
            '<input class="input" id="cat-q" type="search" placeholder="Nama atau kode kategori…" value="' + App.h(ui.q) + '"></div></div>' +
          '<div class="field"><label>&nbsp;</label><button class="btn btn--outline" type="button" id="cat-reset">' + App.icon("refresh") + "Reset</button></div>" +
        "</div>" +
        '<div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>No</th><th>Nama Kategori</th><th>Kode</th><th>Deskripsi</th><th>Status</th><th>Jumlah Permohonan</th><th>Aksi</th>" +
          "</tr></thead><tbody>" +
          (rows.length ? rows.map(function (c, i) {
            const used = state.requests.filter(function (r) { return r.categoryId === c.id; }).length;
            return "<tr><td class=\"table__muted\">" + (i + 1) + "</td>" +
              '<td class="table__primary">' + App.h(c.name) + "</td>" +
              '<td><span class="table__code">' + App.h(c.code) + "</span></td>" +
              "<td>" + App.h(c.description || "—") + "</td>" +
              "<td>" + App.badge(c.active ? "Aktif" : "Nonaktif") + "</td>" +
              "<td>" + used + " permohonan</td>" +
              '<td><div class="table__actions">' +
                '<button class="icon-btn-table" type="button" data-edit-cat="' + App.h(c.id) + '" title="Edit">' + App.icon("edit") + "</button>" +
                '<button class="icon-btn-table icon-btn-table--danger" type="button" data-delete-cat="' + App.h(c.id) + '" title="Hapus">' + App.icon("trash") + "</button>" +
              "</div></td></tr>";
          }).join("") : '<tr><td colspan="7">' + App.empty("Kategori tidak ditemukan", "Coba kata kunci lain.", "folder") + "</td></tr>") +
          "</tbody></table></div></div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.categories.render());
        App.Pages.categories.mount(document.getElementById("page-content"));
      }

      root.querySelector("#cat-q").addEventListener("input", App.debounce(function (e) { ui.q = e.target.value; rerender(); }, 240));
      root.querySelector("#cat-reset").addEventListener("click", function () { ui.q = ""; rerender(); });

      function openForm(existing) {
        App.modal({
          title: existing ? "Edit Kategori" : "Tambah Kategori Baru",
          subtitle: existing ? existing.name : "Lengkapi informasi kategori permohonan",
          confirmText: existing ? "Simpan perubahan" : "Tambah kategori",
          body: formBody(existing),
          onConfirm(modal) {
            const name = modal.querySelector("#cat-name").value.trim();
            const code = modal.querySelector("#cat-code").value.trim().toUpperCase();
            const desc = modal.querySelector("#cat-desc").value.trim();
            const active = modal.querySelector("#cat-active").checked;
            const err = modal.querySelector("#cat-error");
            if (!name || !code) { err.textContent = "Nama dan kode kategori wajib diisi."; return false; }

            const state = App.Store.get();
            const duplicate = state.categories.some(function (c) {
              return c.code.toLowerCase() === code.toLowerCase() && (!existing || c.id !== existing.id);
            });
            if (duplicate) { err.textContent = "Kode kategori sudah digunakan."; return false; }

            App.Store.update(function (s) {
              if (existing) {
                const c = s.categories.find(function (x) { return x.id === existing.id; });
                Object.assign(c, { name, code, description: desc, active });
                App.Store.log(s, "Kategori", "Mengubah kategori " + name);
              } else {
                s.categories.push({ id: App.Store.uid("cat"), name, code, description: desc, info: desc || "—", availability: "Tersedia", icon: "folder", active });
                App.Store.log(s, "Kategori", "Menambahkan kategori " + name);
              }
            });
            App.toast("Berhasil", existing ? "Kategori diperbarui." : "Kategori baru ditambahkan.", "success");
            rerender();
          }
        });
      }

      root.querySelector("#add-category").addEventListener("click", function () { openForm(null); });
      root.querySelectorAll("[data-edit-cat]").forEach(function (b) {
        b.addEventListener("click", function () {
          const c = App.Store.get().categories.find(function (x) { return x.id === b.dataset.editCat; });
          if (c) openForm(c);
        });
      });
      root.querySelectorAll("[data-delete-cat]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.deleteCat;
          const state = App.Store.get();
          const c = state.categories.find(function (x) { return x.id === id; });
          const used = state.requests.filter(function (r) { return r.categoryId === id; }).length;
          App.confirm("Hapus kategori", "Kategori " + (c ? c.name : id) + " akan dihapus." +
            (used ? " Masih ada " + used + " permohonan yang menggunakan kategori ini." : ""), function () {
            App.Store.update(function (s) {
              s.categories = s.categories.filter(function (x) { return x.id !== id; });
              App.Store.log(s, "Kategori", "Menghapus kategori " + (c ? c.name : id));
            });
            App.toast("Berhasil", "Kategori dihapus.", "success");
            rerender();
          }, { confirmText: "Ya, hapus" });
        });
      });
    }
  };
})();
