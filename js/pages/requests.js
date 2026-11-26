/* ==========================================================================
   pages/requests.js — Data Permohonan: search, filter, pagination, CRUD
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  const ui = { q: "", category: "", date: "", status: "", page: 1, perPage: 8 };

  function filtered() {
    const state = App.Store.get();
    const q = ui.q.trim().toLowerCase();
    let list = state.requests.slice();

    if (q) {
      list = list.filter(function (r) {
        return [r.id, r.applicant, r.email, r.subject].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }
    if (ui.category) list = list.filter(function (r) { return r.categoryId === ui.category; });
    if (ui.date) list = list.filter(function (r) { return App.monthKey(r.submittedAt) === ui.date.slice(0, 7); });
    if (ui.status) list = list.filter(function (r) { return r.status === ui.status; });

    return list.sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }

  function paginationBar(pg) {
    let buttons = '<button class="page-btn" data-page="' + (pg.page - 1) + '" ' + (pg.page === 1 ? "disabled" : "") + ">‹</button>";
    for (let i = 1; i <= pg.pages; i++) {
      buttons += '<button class="page-btn ' + (i === pg.page ? "active" : "") + '" data-page="' + i + '">' + i + "</button>";
    }
    buttons += '<button class="page-btn" data-page="' + (pg.page + 1) + '" ' + (pg.page === pg.pages ? "disabled" : "") + ">›</button>";

    return '<div class="pagination"><div class="pagination__info">Menampilkan ' +
      (pg.total ? (pg.page - 1) * ui.perPage + 1 : 0) + "–" + Math.min(pg.page * ui.perPage, pg.total) +
      " dari <strong>" + pg.total + "</strong> permohonan</div>" +
      '<div class="pagination__pages">' + buttons + "</div></div>";
  }

  App.Pages.requests = {
    title: "Data Permohonan",
    subtitle: "Kelola seluruh data permohonan masuk",

    render() {
      const state = App.Store.get();
      const result = App.paginate(filtered(), ui.page, ui.perPage);
      ui.page = result.page;

      const statusOptions = App.STATUS_LIST.slice();

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Data Permohonan</h2>' +
        '<p>Total ' + state.requests.length + " permohonan terdaftar dalam sistem</p></div>" +
        '<div class="page-toolbar__actions">' +
          '<button class="btn btn--outline" type="button" id="export-requests">' + App.icon("download") + "Ekspor CSV</button>" +
          '<button class="btn btn--primary" type="button" id="add-request">' + App.icon("plus") + "Tambah Permohonan</button>" +
        "</div></div>" +

        '<div class="card"><div class="filters">' +
          '<div class="field"><label>Cari permohonan</label><div class="input-group">' + App.icon("search", "input-group__icon") +
            '<input class="input" id="filter-q" type="search" placeholder="Kode, nama, atau subjek…" value="' + App.h(ui.q) + '"></div></div>' +
          '<div class="field"><label>Kategori</label><select class="select" id="filter-category"><option value="">Semua kategori</option>' +
            state.categories.map(function (c) { return '<option value="' + c.id + '" ' + (ui.category === c.id ? "selected" : "") + ">" + App.h(c.name) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>Status</label><select class="select" id="filter-status"><option value="">Semua status</option>' +
            statusOptions.map(function (s) { return '<option value="' + s + '" ' + (ui.status === s ? "selected" : "") + ">" + s + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>Tanggal pengajuan</label><input class="input" type="date" id="filter-date" value="' + App.h(ui.date) + '"></div>' +
          '<div class="filters__actions"><button class="btn btn--outline btn--sm" type="button" id="reset-filter">' + App.icon("refresh") + "Reset</button></div>" +
        "</div>" +

        '<div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>No</th><th>Kode Permohonan</th><th>Nama Pemohon</th><th>Kategori</th><th>Tanggal Pengajuan</th><th>Status</th><th>Aksi</th>" +
          "</tr></thead><tbody>" +
          (result.items.length ? result.items.map(function (r, i) {
            const cat = state.categories.find(function (c) { return c.id === r.categoryId; });
            const no = (result.page - 1) * ui.perPage + i + 1;
            return "<tr><td class=\"table__muted\">" + no + "</td>" +
              '<td><span class="table__code">' + App.h(r.id) + "</span></td>" +
              '<td><div class="avatar-cell"><span class="avatar">' + App.h(r.applicant.split(" ").map(function (x) { return x[0]; }).slice(0, 2).join("")) + "</span>" +
                '<div><div class="table__primary">' + App.h(r.applicant) + '</div><div class="table__muted">' + App.h(r.email) + "</div></div></div></td>" +
              "<td>" + App.h(cat ? cat.name : "—") + "</td>" +
              "<td>" + App.fmtDate(r.submittedAt) + "</td>" +
              "<td>" + App.statusBadge(r.status) + "</td>" +
              '<td><div class="table__actions">' +
                '<a class="icon-btn-table" href="#/admin/detail/' + encodeURIComponent(r.id) + '" title="Lihat detail">' + App.icon("eye") + "</a>" +
                '<a class="icon-btn-table" href="#/admin/verification/' + encodeURIComponent(r.id) + '" title="Verifikasi">' + App.icon("checkSquare") + "</a>" +
                '<button class="icon-btn-table icon-btn-table--danger" type="button" data-delete="' + App.h(r.id) + '" title="Hapus">' + App.icon("trash") + "</button>" +
              "</div></td></tr>";
          }).join("") : '<tr><td colspan="7">' + App.empty("Tidak ada permohonan", "Coba ubah kata kunci atau filter pencarian.", "search") + "</td></tr>") +
          "</tbody></table></div>" + paginationBar(result) + "</div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.requests.render());
        App.Pages.requests.mount(document.getElementById("page-content"));
      }

      const q = root.querySelector("#filter-q");
      q.addEventListener("input", App.debounce(function (e) { ui.q = e.target.value; ui.page = 1; rerender(); }, 260));
      root.querySelector("#filter-category").addEventListener("change", function (e) { ui.category = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#filter-status").addEventListener("change", function (e) { ui.status = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#filter-date").addEventListener("change", function (e) { ui.date = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#reset-filter").addEventListener("click", function () {
        ui.q = ui.category = ui.date = ui.status = ""; ui.page = 1; rerender();
        App.toast("Filter direset", "Semua filter pencarian dikembalikan.", "info");
      });

      root.querySelectorAll("[data-page]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          ui.page = Number(b.dataset.page); rerender();
        });
      });

      root.querySelectorAll("[data-delete]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.delete;
          App.confirm("Hapus permohonan", "Permohonan " + id + " akan dihapus permanen beserta file hasil terkait. Lanjutkan?", function () {
            App.Store.update(function (s) {
              s.requests = s.requests.filter(function (r) { return r.id !== id; });
              s.resultFiles = s.resultFiles.filter(function (f) { return f.requestId !== id; });
              App.Store.log(s, "Penghapusan", "Menghapus permohonan " + id);
            });
            App.toast("Berhasil", "Permohonan " + id + " dihapus.", "success");
            App.Layout.refresh();
            rerender();
          }, { confirmText: "Ya, hapus", subtitle: "Tindakan ini tidak dapat dibatalkan." });
        });
      });

      root.querySelector("#export-requests").addEventListener("click", function () {
        const rows = filtered();
        if (!rows.length) return App.toast("Gagal", "Tidak ada data untuk diekspor.", "error");
        const header = "Kode,Nama,Email,Kategori,Tanggal,Status\n";
        const state = App.Store.get();
        const body = rows.map(function (r) {
          const cat = state.categories.find(function (c) { return c.id === r.categoryId; });
          return [r.id, r.applicant, r.email, cat ? cat.name : "", App.fmtDate(r.submittedAt), r.status]
            .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");
        App.download(header + body, "data-permohonan.csv", "text/csv;charset=utf-8");
        App.toast("Berhasil", "Data permohonan diekspor ke CSV.", "success");
      });

      root.querySelector("#add-request").addEventListener("click", function () {
        const state = App.Store.get();
        App.modal({
          title: "Tambah Permohonan",
          subtitle: "Buat data permohonan baru atas nama pemohon",
          confirmText: "Simpan permohonan",
          body:
            '<div class="field"><label>Pemohon <span class="required">*</span></label><select class="select" id="ar-user">' +
              state.users.filter(function (u) { return u.role === "Pemohon"; }).map(function (u) {
                return '<option value="' + App.h(u.id) + '">' + App.h(u.name) + " · " + App.h(u.email) + "</option>";
              }).join("") + "</select></div>" +
            '<div class="field-row">' +
              '<div class="field"><label>Kategori <span class="required">*</span></label><select class="select" id="ar-category">' +
                state.categories.filter(function (c) { return c.active; }).map(function (c) { return '<option value="' + c.id + '">' + App.h(c.name) + "</option>"; }).join("") +
              "</select></div>" +
              '<div class="field"><label>Tanggal Pengajuan <span class="required">*</span></label><input class="input" id="ar-date" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
            "</div>" +
            '<div class="field"><label>Subjek Permohonan <span class="required">*</span></label><input class="input" id="ar-subject" placeholder="Contoh: Permohonan data debit sungai"></div>' +
            '<div class="field"><label>Data yang Dibutuhkan <span class="required">*</span></label><textarea class="textarea" id="ar-data" placeholder="Jelaskan data yang dibutuhkan…"></textarea></div>' +
            '<div class="field"><label>Tujuan Penggunaan <span class="required">*</span></label><textarea class="textarea" id="ar-purpose" placeholder="Tujuan penggunaan data…"></textarea></div>' +
            '<div class="form-error" id="ar-error"></div>',
          onConfirm(modal) {
            const userId = modal.querySelector("#ar-user").value;
            const category = modal.querySelector("#ar-category").value;
            const date = modal.querySelector("#ar-date").value;
            const subject = modal.querySelector("#ar-subject").value.trim();
            const dataNeeded = modal.querySelector("#ar-data").value.trim();
            const purpose = modal.querySelector("#ar-purpose").value.trim();
            const err = modal.querySelector("#ar-error");
            if (!userId || !category || !date || !subject || !dataNeeded || purpose.length < 10) {
              err.textContent = "Lengkapi seluruh kolom wajib dengan benar (tujuan minimal 10 karakter).";
              return false;
            }
            const applicant = App.Store.get().users.find(function (u) { return u.id === userId; });

            let ticket = "";
            App.Store.update(function (s) {
              ticket = App.Store.nextTicket(s);
              const at = date + "T09:00:00";
              s.requests.unshift({
                id: ticket, userId: applicant.id, applicant: applicant.name, email: applicant.email,
                phone: applicant.phone || "-", nik: applicant.nik || "-", institution: applicant.institution || "-",
                applicantType: applicant.applicantType, address: applicant.address || "-",
                categoryId: category, subject, dataNeeded, purpose, detail: "", neededAt: "",
                submittedAt: at, status: "Diajukan", documents: [], notes: "",
                verification: { checked: false, complete: false, note: "", checkedBy: "", checkedAt: "", checks: {} },
                repairReason: "", resultFileIds: [], updatedAt: new Date().toISOString(),
                history: [{ at: new Date().toISOString(), text: "Permohonan dibuat oleh petugas atas nama pemohon", status: "Diajukan", actor: App.Auth.displayName() }]
              });
              App.Store.notify(s, applicant.id, "Permohonan berhasil dibuat", "Petugas membuat permohonan " + ticket + " atas nama Anda.", "success", ticket);
              App.Store.log(s, "Permohonan", "Menambahkan permohonan " + ticket + " atas nama " + applicant.name);
            });
            App.toast("Berhasil", "Permohonan baru berhasil ditambahkan: " + ticket, "success");
            App.Layout.refresh();
            rerender();
          }
        });
      });
    }
  };
})();
