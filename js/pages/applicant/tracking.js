/* ==========================================================================
   applicant/tracking.js — Tracking status seluruh permohonan pemohon
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  const ORDER = App.STATUS_LIST;
  const CORE = ["Diajukan", "Menunggu Verifikasi", "Disetujui", "Dalam Proses", "Selesai"];

  function progressFor(status) {
    if (status === "Ditolak") return 1;
    if (status === "Perlu Perbaikan") return 2;
    const idx = CORE.indexOf(status);
    return idx === -1 ? 1 : idx + 1;
  }

  App.ApplicantPages.tracking = {
    title: "Tracking Status",
    subtitle: "Pantau perkembangan pengajuan",

    render() {
      const user = App.Auth.currentUser();
      const rows = App.Store.get().requests.filter(function (r) { return r.userId === user.id; })
        .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Tracking Permohonan</h2>' +
          '<p>Lihat posisi perkembangan setiap permohonan Anda dalam alur pelayanan.</p></div>' +
          '<div class="page-toolbar__actions"><a class="btn btn--outline" href="#/saya/permohonan">' + App.icon("files") + "Daftar lengkap</a></div></div>" +

          (rows.length ? '<div class="tracking-list">' + rows.map(function (r) {
            const step = progressFor(r.status);
            const total = CORE.length;
            const pct = Math.round((step / total) * 100);
            const last = r.history[r.history.length - 1];
            return '<article class="tracking-card">' +
              '<div class="tracking-card__head"><div><span class="table__code">' + App.h(r.id) + "</span><h3>" + App.h(r.subject) + "</h3>" +
                "<p>Diajukan " + App.fmtDateTime(r.submittedAt) + " · " + App.h(App.category(r.categoryId) ? App.category(r.categoryId).name : "—") + "</p></div>" +
                App.statusBadge(r.status) + "</div>" +
              '<div class="tracking-progress"><div class="tracking-progress__track"><div class="tracking-progress__fill" style="width:' + (r.status === "Ditolak" || r.status === "Perlu Perbaikan" ? 35 : pct) + '%"></div></div>' +
                '<span>' + (r.status === "Ditolak" ? "Alur dihentikan" : r.status === "Perlu Perbaikan" ? "Menunggu perbaikan" : step + " dari " + total + " tahap") + "</span></div>" +
              '<div class="tracking-card__foot"><div><span class="muted">Update terakhir</span><strong>' + App.h(last ? last.text : "—") + "</strong><small>" + App.fmtDateTime(r.updatedAt) + "</small></div>" +
                '<a class="btn btn--outline btn--sm" href="#/saya/detail/' + encodeURIComponent(r.id) + '">Lihat timeline ' + App.icon("arrowRight") + "</a></div>" +
            "</article>";
          }).join("") + "</div>" :
            '<div class="card">' + App.empty("Belum ada permohonan", "Ajukan permohonan pertama untuk melihat tracking status.", "activity") + "</div>");
    },

    mount() {}
  };
})();
