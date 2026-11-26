/* ==========================================================================
   applicant/dashboard.js — Ringkasan permohonan milik pemohon
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  function statCard(label, value, icon, tone, hint) {
    return '<div class="stat-card"><div class="stat-card__top"><span class="stat-card__icon tone-' + tone + '">' + App.icon(icon) + "</span>" +
      '<span class="stat-card__trend tone-' + tone + '">' + App.h(hint) + "</span></div>" +
      '<div class="stat-card__value">' + value + '</div><div class="stat-card__label">' + App.h(label) + "</div></div>";
  }

  App.ApplicantPages.dashboard = {
    title: "Dashboard",
    subtitle: "Ringkasan permohonan Anda",

    render() {
      const state = App.Store.get();
      const user = App.Auth.currentUser();
      const mine = state.requests.filter(function (r) { return r.userId === user.id; })
        .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
      const count = function (s) { return mine.filter(function (r) { return r.status === s; }).length; };
      const waiting = count("Diajukan") + count("Menunggu Verifikasi");
      const recent = mine.slice(0, 5);
      const notes = state.notifications.filter(function (n) { return n.userId === user.id && !n.read; })
        .sort(function (a, b) { return new Date(b.at) - new Date(a.at); }).slice(0, 4);

      return '<div class="page-toolbar"><div class="page-toolbar__text">' +
          "<h2>Selamat datang, " + App.h(user.name.split(" ")[0]) + " 👋</h2>" +
          "<p>Pantau pengajuan data Anda dan lihat perkembangan terbaru dari BBWS Bengawan Solo.</p></div>" +
          '<div class="page-toolbar__actions"><a class="btn btn--outline" href="#/katalog">' + App.icon("folder") + "Katalog Data</a>" +
          '<a class="btn btn--primary" href="#/saya/baru">' + App.icon("plus") + "Buat Permohonan</a></div></div>" +

          '<div class="stat-grid stat-grid--four">' +
            statCard("Total Pengajuan", mine.length, "files", "navy", "Semua") +
            statCard("Menunggu Verifikasi", waiting, "clock", "amber", "Perlu ditunggu") +
            statCard("Dalam Proses", count("Dalam Proses"), "activity", "purple", "Sedang diproses") +
            statCard("Selesai", count("Selesai"), "checkCircle", "green", "Data tersedia") +
          "</div>" +

          (mine.some(function (r) { return r.status === "Perlu Perbaikan"; }) ?
            '<div class="notice-banner"><span class="notice-banner__icon">' + App.icon("alert") + "</span><div><strong>Ada permohonan yang perlu diperbaiki</strong>" +
            "<p>Petugas meminta kelengkapan dokumen. Segera perbaiki agar proses dapat dilanjutkan.</p></div>" +
            '<a class="btn btn--warning btn--sm" href="#/saya/permohonan">Lihat permohonan</a></div>' : "") +

          '<div class="dashboard-grid dashboard-grid--bottom">' +
            '<div class="card"><div class="card__head"><div><h3>Pengajuan Terbaru</h3><p>5 permohonan terakhir yang Anda kirim</p></div>' +
              '<a class="btn btn--ghost btn--sm" href="#/saya/permohonan">Lihat semua ' + App.icon("chevronRight") + "</a></div>" +
              '<div class="card__body card__body--flush">' + (recent.length ?
                '<div class="table-wrap"><table class="table"><thead><tr><th>Nomor Tiket</th><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>' +
                recent.map(function (r) {
                  const cat = App.category(r.categoryId);
                  return "<tr><td><span class=\"table__code\">" + App.h(r.id) + "</span></td>" +
                    '<td class="table__primary">' + App.h(r.subject) + "</td>" +
                    "<td>" + App.h(cat ? cat.name : "—") + "</td>" +
                    "<td>" + App.fmtDate(r.submittedAt) + "</td>" +
                    "<td>" + App.statusBadge(r.status) + "</td>" +
                    '<td><a class="icon-btn-table" href="#/saya/detail/' + encodeURIComponent(r.id) + '" title="Lihat detail">' + App.icon("eye") + "</a></td></tr>";
                }).join("") + "</tbody></table></div>" :
                App.empty("Belum ada pengajuan", "Mulai dengan mengajukan permohonan data pertama Anda.", "files")) + "</div></div>" +

            '<div style="display:flex;flex-direction:column;gap:18px">' +
              '<div class="card"><div class="card__head"><div><h3>Notifikasi Terbaru</h3><p>Perubahan status pada pengajuan Anda</p></div>' +
                '<a class="btn btn--ghost btn--sm" href="#/saya/notifikasi">Semua</a></div>' +
                '<div class="card__body"><ul class="activity-list">' + (notes.length ? notes.map(function (n) {
                  return '<li class="activity-item"><span class="activity-item__dot tone-' + (n.type === "warning" ? "amber" : n.type === "error" ? "red" : "blue") + '">' +
                    App.icon(n.type === "warning" ? "alert" : n.type === "error" ? "alertCircle" : "checkCircle") + "</span>" +
                    "<div><strong>" + App.h(n.title) + "</strong><p>" + App.h(n.message) + "</p><time>" + App.timeAgo(n.at) + "</time></div></li>";
                }).join("") : '<li class="activity-item"><div><strong>Belum ada notifikasi baru</strong><p>Informasi status akan muncul di sini.</p></div></li>') + "</ul></div></div>" +

              '<div class="card quick-guide"><div class="card__head"><h3>Langkah Permohonan</h3></div><div class="card__body">' +
                '<a class="quick-guide__row" href="#/saya/baru"><span>1</span><div><strong>Ajukan permohonan</strong><small>Isi formulir dan unggah dokumen</small></div>' + App.icon("chevronRight") + "</a>" +
                '<a class="quick-guide__row" href="#/saya/tracking"><span>2</span><div><strong>Pantau status</strong><small>Lihat timeline perkembangan</small></div>' + App.icon("chevronRight") + "</a>" +
                '<a class="quick-guide__row" href="#/saya/permohonan"><span>3</span><div><strong>Unduh data hasil</strong><small>Tersedia setelah status Selesai</small></div>' + App.icon("chevronRight") + "</a>" +
              "</div></div>" +
            "</div>" +
          "</div>";
    },

    mount() {}
  };
})();
