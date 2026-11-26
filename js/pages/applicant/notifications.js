/* ==========================================================================
   applicant/notifications.js — Notifikasi perubahan status permohonan
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  App.ApplicantPages.notifications = {
    title: "Notifikasi",
    subtitle: "Pemberitahuan perubahan status",

    render() {
      const user = App.Auth.currentUser();
      const items = App.Store.get().notifications.filter(function (n) { return n.userId === user.id; })
        .sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
      const unread = items.filter(function (n) { return !n.read; }).length;

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Notifikasi</h2>' +
          "<p>" + unread + " notifikasi belum dibaca dari total " + items.length + " pemberitahuan</p></div>" +
          '<div class="page-toolbar__actions"><button class="btn btn--outline" type="button" id="read-all"' + (unread ? "" : " disabled") + '>' + App.icon("checkSquare") + "Tandai semua dibaca</button></div></div>" +
          '<div class="card"><div class="card__body">' + (items.length ? '<ul class="notification-list">' + items.map(function (n) {
            const icon = n.type === "warning" ? "alert" : n.type === "error" ? "alertCircle" : n.type === "success" ? "checkCircle" : "info";
            return '<li class="notification-item' + (n.read ? "" : " unread") + '">' +
              '<span class="notification-item__icon tone-' + (n.type === "warning" ? "amber" : n.type === "error" ? "red" : n.type === "success" ? "green" : "blue") + '">' + App.icon(icon) + "</span>" +
              '<div class="notification-item__body"><strong>' + App.h(n.title) + "</strong><p>" + App.h(n.message) + "</p>" +
              "<small>" + App.fmtDateTime(n.at) + (n.requestId ? " · " + App.h(n.requestId) : "") + "</small></div>" +
              (n.requestId ? '<a class="btn btn--outline btn--sm" href="#/saya/detail/' + encodeURIComponent(n.requestId) + '">Lihat</a>' : "") +
              (n.read ? "" : '<button class="icon-btn-table" type="button" data-read="' + App.h(n.id) + '" title="Tandai dibaca">' + App.icon("check") + "</button>") +
            "</li>";
          }).join("") + "</ul>" : App.empty("Belum ada notifikasi", "Notifikasi akan muncul ketika status permohonan berubah.", "bell")) + "</div></div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.ApplicantPages.notifications.render());
        App.ApplicantPages.notifications.mount(document.getElementById("page-content"));
      }
      root.querySelectorAll("[data-read]").forEach(function (b) {
        b.addEventListener("click", function () {
          App.Store.update(function (s) {
            const n = s.notifications.find(function (x) { return x.id === b.dataset.read; });
            if (n) n.read = true;
          });
          App.Layout.refresh(); rerender();
        });
      });
      const all = root.querySelector("#read-all");
      if (all) all.addEventListener("click", function () {
        const user = App.Auth.currentUser();
        App.Store.update(function (s) { s.notifications.forEach(function (n) { if (n.userId === user.id) n.read = true; }); });
        App.Layout.refresh(); rerender();
        App.toast("Berhasil", "Semua notifikasi ditandai sudah dibaca.", "success");
      });
    }
  };
})();
