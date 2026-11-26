/* ==========================================================================
   applicant/requests.js — Daftar permohonan milik pemohon + filter
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  const ui = { q: "", status: "", category: "", page: 1, perPage: 8 };

  function mine() {
    const user = App.Auth.currentUser();
    const q = ui.q.trim().toLowerCase();
    return App.Store.get().requests.filter(function (r) {
      if (r.userId !== user.id) return false;
      if (q && [r.id, r.subject, r.dataNeeded].join(" ").toLowerCase().indexOf(q) === -1) return false;
      if (ui.status && r.status !== ui.status) return false;
      if (ui.category && r.categoryId !== ui.category) return false;
      return true;
    }).sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }

  App.ApplicantPages.requests = {
    title: "Permohonan Saya",
    subtitle: "Daftar seluruh pengajuan Anda",

    render() {
      const state = App.Store.get();
      const result = App.paginate(mine(), ui.page, ui.perPage);
      ui.page = result.page;

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Permohonan Saya</h2>' +
          "<p>" + result.total + " permohonan yang telah Anda ajukan</p></div>" +
          '<div class="page-toolbar__actions"><a class="btn btn--primary" href="#/saya/baru">' + App.icon("plus") + "Buat Permohonan</a></div></div>" +

          '<div class="card"><div class="filters">' +
            '<div class="field"><label>Cari permohonan</label><div class="input-group">' + App.icon("search", "input-group__icon") +
              '<input class="input" id="ar-q" type="search" placeholder="Nomor tiket atau judul…" value="' + App.h(ui.q) + '"></div></div>' +
            '<div class="field"><label>Kategori</label><select class="select" id="ar-category"><option value="">Semua kategori</option>' +
              state.categories.map(function (c) { return '<option value="' + c.id + '" ' + (ui.category === c.id ? "selected" : "") + ">" + App.h(c.name) + "</option>"; }).join("") + "</select></div>" +
            '<div class="field"><label>Status</label><select class="select" id="ar-status"><option value="">Semua status</option>' +
              App.STATUS_LIST.map(function (s) { return '<option value="' + s + '" ' + (ui.status === s ? "selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>" +
            '<div class="filters__actions"><button class="btn btn--outline btn--sm" type="button" id="ar-reset">' + App.icon("refresh") + "Reset</button></div>" +
          "</div>" +
          '<div class="card__body card__body--flush">' +
            (result.items.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Nomor Tiket</th><th>Judul Permohonan</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
              result.items.map(function (r) {
                const cat = App.category(r.categoryId);
                return "<tr><td><span class=\"table__code\">" + App.h(r.id) + "</span></td>" +
                  '<td><div class="table__primary">' + App.h(r.subject) + '</div><div class="table__muted">' + App.h(r.institution || "-") + "</div></td>" +
                  "<td>" + App.h(cat ? cat.name : "—") + "</td>" +
                  "<td>" + App.fmtDate(r.submittedAt) + "</td>" +
                  "<td>" + App.statusBadge(r.status) + "</td>" +
                  '<td><div class="table__actions"><a class="btn btn--blue btn--sm" href="#/saya/detail/' + encodeURIComponent(r.id) + '">' + App.icon("eye") + "Detail</a></div></td></tr>";
              }).join("") + "</tbody></table></div>" + paginationBar(result) :
              App.empty("Belum ada permohonan", "Coba ubah filter atau buat permohonan baru.", "files")) +
          "</div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.ApplicantPages.requests.render());
        App.ApplicantPages.requests.mount(document.getElementById("page-content"));
      }
      root.querySelector("#ar-q").addEventListener("input", App.debounce(function (e) { ui.q = e.target.value; ui.page = 1; rerender(); }, 240));
      root.querySelector("#ar-category").addEventListener("change", function (e) { ui.category = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#ar-status").addEventListener("change", function (e) { ui.status = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#ar-reset").addEventListener("click", function () { ui.q = ui.status = ui.category = ""; ui.page = 1; rerender(); });
      root.querySelectorAll("[data-page]").forEach(function (b) {
        b.addEventListener("click", function () { if (!b.disabled) { ui.page = Number(b.dataset.page); rerender(); } });
      });
    }
  };

  function paginationBar(pg) {
    let buttons = '<button class="page-btn" data-page="' + (pg.page - 1) + '" ' + (pg.page === 1 ? "disabled" : "") + ">‹</button>";
    for (let i = 1; i <= pg.pages; i++) {
      buttons += '<button class="page-btn ' + (i === pg.page ? "active" : "") + '" data-page="' + i + '">' + i + "</button>";
    }
    buttons += '<button class="page-btn" data-page="' + (pg.page + 1) + '" ' + (pg.page === pg.pages ? "disabled" : "") + ">›</button>";
    return '<div class="pagination"><div class="pagination__info">Menampilkan ' + (pg.total ? (pg.page - 1) * ui.perPage + 1 : 0) + "–" +
      Math.min(pg.page * ui.perPage, pg.total) + " dari <strong>" + pg.total + "</strong> permohonan</div><div class=\"pagination__pages\">" + buttons + "</div></div>";
  }
})();
