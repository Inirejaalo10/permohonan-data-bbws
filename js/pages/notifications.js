/* ==========================================================================
   pages/notifications.js — Notifikasi admin/petugas atas permohonan aktif
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  App.Pages.notifications = {
    title: "Notifikasi",
    subtitle: "Pemberitahuan perubahan status",

    render() {
      const state = App.Store.get();
      const items = state.requests.filter(function (r) {
        return ["Diajukan", "Menunggu Verifikasi", "Perlu Perbaikan"].indexOf(r.status) !== -1;
      }).sort(function (a, b) { return new Date(b.updatedAt || b.submittedAt) - new Date(a.updatedAt || a.submittedAt); });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Notifikasi Petugas</h2>' +
          "<p>" + items.length + " permohonan memerlukan perhatian petugas</p></div>" +
          '<div class="page-toolbar__actions"><a class="btn btn--primary" href="#/admin/verification">' + App.icon("checkSquare") + "Buka Verifikasi</a></div></div>" +
          '<div class="card"><div class="card__body">' + (items.length ? '<ul class="notification-list">' + items.map(function (r) {
            const icon = r.status === "Perlu Perbaikan" ? "alert" : r.status === "Diajukan" ? "inbox" : "eye";
            const tone = r.status === "Perlu Perbaikan" ? "amber" : r.status === "Diajukan" ? "green" : "blue";
            return '<li class="notification-item unread"><span class="notification-item__icon tone-' + tone + '">' + App.icon(icon) + "</span>" +
              '<div class="notification-item__body"><strong>' + App.h(r.id) + " · " + App.h(r.applicant) + "</strong>" +
              "<p>" + App.h(r.subject) + "</p><small>" + App.h(r.status) + " · " + App.timeAgo(r.updatedAt || r.submittedAt) + "</small></div>" +
              '<a class="btn btn--outline btn--sm" href="#/admin/verification/' + encodeURIComponent(r.id) + '">Proses</a></li>';
          }).join("") + "</ul>" : App.empty("Tidak ada notifikasi", "Seluruh permohonan sudah tertangani.", "checkCircle")) + "</div></div>";
    },

    mount() {}
  };
})();
