/* ==========================================================================
   pages/activity.js — Riwayat aktivitas admin dengan pencarian & filter
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  const ui = { q: "", type: "", date: "", page: 1, perPage: 10 };

  function filtered() {
    const state = App.Store.get();
    const q = ui.q.trim().toLowerCase();
    let rows = state.activities.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    if (q) rows = rows.filter(function (a) { return [a.admin, a.type, a.detail].join(" ").toLowerCase().indexOf(q) !== -1; });
    if (ui.type) rows = rows.filter(function (a) { return a.type === ui.type; });
    if (ui.date) rows = rows.filter(function (a) { return App.monthKey(a.at) === ui.date.slice(0, 7); });
    return rows;
  }

  function toneFor(type) {
    const map = { Verifikasi: "blue", Penolakan: "red", Upload: "purple", Perbaikan: "amber", Kategori: "green", Pengguna: "slate", Penghapusan: "red", Permohonan: "blue" };
    return map[type] || "slate";
  }

  App.Pages.activity = {
    title: "Riwayat Aktivitas",
    subtitle: "Catatan seluruh tindakan administrator",

    render() {
      const result = App.paginate(filtered(), ui.page, ui.perPage);
      ui.page = result.page;
      const types = Array.from(new Set(App.Store.get().activities.map(function (a) { return a.type; }))).sort();

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Riwayat Aktivitas</h2>' +
        "<p>" + result.total + " aktivitas tercatat dalam sistem</p></div>" +
        '<div class="page-toolbar__actions"><button class="btn btn--outline" type="button" id="export-activity">' +
          App.icon("download") + "Ekspor CSV</button></div></div>" +

        '<div class="card"><div class="filters">' +
          '<div class="field"><label>Cari aktivitas</label><div class="input-group">' + App.icon("search", "input-group__icon") +
            '<input class="input" id="act-q" type="search" placeholder="Admin, jenis, atau detail…" value="' + App.h(ui.q) + '"></div></div>' +
          '<div class="field"><label>Jenis aktivitas</label><select class="select" id="act-type"><option value="">Semua jenis</option>' +
            types.map(function (t) { return '<option value="' + App.h(t) + '" ' + (ui.type === t ? "selected" : "") + ">" + App.h(t) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>Bulan</label><input class="input" type="month" id="act-date" value="' + App.h(ui.date) + '"></div>' +
          '<div class="field"><label>&nbsp;</label><button class="btn btn--outline" type="button" id="act-reset">' + App.icon("refresh") + "Reset</button></div>" +
        "</div>" +

        '<div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>No</th><th>Nama Admin</th><th>Jenis Aktivitas</th><th>Data yang Diubah</th><th>Tanggal &amp; Waktu</th>" +
          "</tr></thead><tbody>" +
          (result.items.length ? result.items.map(function (a, i) {
            return "<tr><td class=\"table__muted\">" + ((result.page - 1) * ui.perPage + i + 1) + "</td>" +
              '<td><div class="avatar-cell"><span class="avatar">' + App.h(a.admin.split(" ").map(function (x) { return x[0]; }).slice(0, 2).join("")) + "</span>" +
                '<span class="table__primary">' + App.h(a.admin) + "</span></div></td>" +
              "<td>" + App.badge(a.type, toneFor(a.type)) + "</td>" +
              "<td>" + App.h(a.detail) + "</td>" +
              "<td>" + App.fmtDateTime(a.at) + "</td></tr>";
          }).join("") : '<tr><td colspan="5">' + App.empty("Tidak ada aktivitas", "Coba ubah kata kunci atau filter.", "history") + "</td></tr>") +
          "</tbody></table></div>" +
          '<div class="pagination"><div class="pagination__info">Menampilkan ' +
            (result.total ? (result.page - 1) * ui.perPage + 1 : 0) + "–" + Math.min(result.page * ui.perPage, result.total) +
            " dari <strong>" + result.total + "</strong> aktivitas</div>" +
            '<div class="pagination__pages">' +
              '<button class="page-btn" data-page="' + (result.page - 1) + '" ' + (result.page === 1 ? "disabled" : "") + ">‹</button>" +
              '<span class="pagination__info">Halaman ' + result.page + " / " + result.pages + "</span>" +
              '<button class="page-btn" data-page="' + (result.page + 1) + '" ' + (result.page === result.pages ? "disabled" : "") + ">›</button>" +
            "</div></div>" +
        "</div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.activity.render());
        App.Pages.activity.mount(document.getElementById("page-content"));
      }

      root.querySelector("#act-q").addEventListener("input", App.debounce(function (e) { ui.q = e.target.value; ui.page = 1; rerender(); }, 240));
      root.querySelector("#act-type").addEventListener("change", function (e) { ui.type = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#act-date").addEventListener("change", function (e) { ui.date = e.target.value; ui.page = 1; rerender(); });
      root.querySelector("#act-reset").addEventListener("click", function () {
        ui.q = ui.type = ui.date = ""; ui.page = 1; rerender();
      });

      root.querySelectorAll("[data-page]").forEach(function (b) {
        b.addEventListener("click", function () { if (!b.disabled) { ui.page = Number(b.dataset.page); rerender(); } });
      });

      root.querySelector("#export-activity").addEventListener("click", function () {
        const rows = filtered();
        if (!rows.length) return App.toast("Gagal", "Tidak ada data untuk diekspor.", "error");
        const csv = "Admin,Jenis,Detail,Waktu\n" + rows.map(function (a) {
          return [a.admin, a.type, a.detail, App.fmtDateTime(a.at)].map(function (v) {
            return '"' + String(v).replace(/"/g, '""') + '"';
          }).join(",");
        }).join("\n");
        App.download(csv, "riwayat-aktivitas.csv", "text/csv;charset=utf-8");
        App.toast("Berhasil", "Riwayat aktivitas diekspor.", "success");
      });
    }
  };
})();
