/* ==========================================================================
   pages/dashboard.js — Ringkasan, grafik, tabel terbaru, aktivitas
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  function statCard(label, value, icon, tone, trend) {
    return '<div class="stat-card">' +
      '<div class="stat-card__top"><span class="stat-card__icon tone-' + tone + '">' + App.icon(icon) + "</span>" +
      '<span class="stat-card__trend tone-' + tone + '">' + App.h(trend) + "</span></div>" +
      '<div class="stat-card__value">' + value + "</div>" +
      '<div class="stat-card__label">' + App.h(label) + "</div></div>";
  }

  function monthlyData(requests) {
    const map = {};
    requests.forEach(function (r) {
      const key = App.monthKey(r.submittedAt);
      map[key] = (map[key] || 0) + 1;
    });
    const keys = Object.keys(map).sort().slice(-6);
    return keys.map(function (k) { return { key: k, label: App.monthLabel(k), value: map[k] }; });
  }

  function chart(data) {
    const W = 700, H = 250, padL = 34, padR = 18, padT = 22, padB = 38;
    const max = Math.max(4, ...data.map(function (d) { return d.value; }));
    const step = (W - padL - padR) / Math.max(1, data.length);
    const barW = Math.min(52, step * .52);
    const plotH = H - padT - padB;
    let grid = "", bars = "";

    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      grid += '<line class="chart-grid" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>' +
        '<text class="chart-label" text-anchor="end" x="' + (padL - 8) + '" y="' + (y + 3) + '">' + Math.round(max - (max / 4) * i) + "</text>";
    }

    data.forEach(function (d, i) {
      const h = Math.max(4, (d.value / max) * plotH);
      const x = padL + step * i + (step - barW) / 2;
      const y = padT + plotH - h;
      bars += '<rect class="chart-bar" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="6"><title>' +
        App.h(d.label) + ": " + d.value + " permohonan</title></rect>" +
        '<text class="chart-value" x="' + (x + barW / 2) + '" y="' + (y - 7) + '">' + d.value + "</text>" +
        '<text class="chart-label" x="' + (x + barW / 2) + '" y="' + (H - 12) + '">' + App.h(d.label) + "</text>";
    });

    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafik permohonan per bulan">' +
      '<defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1a3d68"/></linearGradient></defs>' +
      grid + bars + "</svg>";
  }

  App.Pages.dashboard = {
    title: "Dashboard Admin",
    subtitle: "Ringkasan seluruh aktivitas permohonan",

    render() {
      const state = App.Store.get();
      const requests = state.requests;
      const count = function (s) { return requests.filter(function (r) { return r.status === s; }).length; };

      const recent = requests.slice().sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); }).slice(0, 5);
      const activities = state.activities.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); }).slice(0, 6);
      const data = monthlyData(requests);

      const stats =
        statCard("Total Permohonan", requests.length, "files", "navy", "Semua") +
        statCard("Diajukan", count("Diajukan"), "inbox", "blue", "Permohonan masuk") +
        statCard("Menunggu Verifikasi", count("Menunggu Verifikasi"), "eye", "amber", "Perlu tindakan") +
        statCard("Perlu Perbaikan", count("Perlu Perbaikan"), "alert", "orange", "Menunggu pemohon") +
        statCard("Disetujui", count("Disetujui"), "checkCircle", "green", "Selesai verifikasi") +
        statCard("Dalam Proses", count("Dalam Proses"), "clock", "purple", "Aktif") +
        statCard("Selesai", count("Selesai"), "checkCircle", "slate", "Data tersedia") +
        statCard("Ditolak", count("Ditolak"), "alertCircle", "red", "Tidak lolos");

      const total = requests.length || 1;
      const progress = [
        { label: "Disetujui", value: count("Disetujui"), tone: "#059669" },
        { label: "Dalam Proses", value: count("Dalam Proses"), tone: "#3b82f6" },
        { label: "Perlu Perbaikan", value: count("Perlu Perbaikan"), tone: "#d97706" },
        { label: "Ditolak", value: count("Ditolak"), tone: "#dc2626" }
      ];

      return '<div class="page-toolbar"><div class="page-toolbar__text">' +
        "<h2>Selamat datang, " + App.h(App.Auth.displayName()) + " 👋</h2><p>Berikut ringkasan aktivitas sistem pengelolaan permohonan hari ini.</p></div>" +
        '<div class="page-toolbar__actions">' +
          '<a class="btn btn--outline" href="#/admin/activity">' + App.icon("history") + "Lihat aktivitas</a>" +
          '<a class="btn btn--primary" href="#/admin/verification">' + App.icon("checkSquare") + "Verifikasi permohonan</a>" +
        "</div></div>" +

        '<div class="stat-grid">' + stats + "</div>" +

        '<div class="dashboard-grid">' +
          '<div class="card"><div class="card__head"><div><h3>Statistik Permohonan per Bulan</h3>' +
            "<p>Jumlah permohonan yang masuk dalam 6 bulan terakhir</p></div>" +
            '<button class="btn btn--ghost btn--sm" type="button" id="refresh-chart">' + App.icon("refresh") + "Refresh</button></div>" +
            '<div class="card__body card__body--flush">' + chart(data) + "</div>" +
            '<div class="chart-legend"><span><i class="legend-dot"></i> Jumlah permohonan</span></div></div>' +

          '<div class="card"><div class="card__head"><div><h3>Aktivitas Admin Terbaru</h3><p>Tindakan terakhir yang dilakukan tim</p></div>' +
            '<a class="btn btn--ghost btn--sm" href="#/admin/activity">Semua</a></div>' +
            '<ul class="activity-list">' + activities.map(function (a) {
              return '<li class="activity-item"><span class="activity-item__dot tone-blue">' + App.icon("activity") + "</span>" +
                "<div><strong>" + App.h(a.admin) + " · " + App.h(a.type) + "</strong>" +
                "<p>" + App.h(a.detail) + "</p><time>" + App.timeAgo(a.at) + "</time></div></li>";
            }).join("") + "</ul></div>" +
        "</div>" +

        '<div class="dashboard-grid dashboard-grid--bottom">' +
          '<div class="card"><div class="card__head"><div><h3>Permohonan Terbaru</h3><p>5 permohonan paling baru masuk</p></div>' +
            '<a class="btn btn--ghost btn--sm" href="#/admin/requests">Lihat semua ' + App.icon("chevronRight") + "</a></div>" +
            '<div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
            "<th>Kode</th><th>Pemohon</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th></th>" +
            "</tr></thead><tbody>" + recent.map(function (r) {
              const cat = state.categories.find(function (c) { return c.id === r.categoryId; });
              return "<tr><td><span class=\"table__code\">" + App.h(r.id) + "</span></td>" +
                '<td class="table__primary">' + App.h(r.applicant) + "</td>" +
                "<td>" + App.h(cat ? cat.name : "—") + "</td>" +
                "<td>" + App.fmtDate(r.submittedAt) + "</td>" +
                "<td>" + App.statusBadge(r.status) + "</td>" +
                '<td><a class="icon-btn-table" href="#/admin/detail/' + encodeURIComponent(r.id) + '" title="Lihat detail">' + App.icon("eye") + "</a></td></tr>";
            }).join("") + "</tbody></table></div></div></div>" +

          '<div class="card"><div class="card__head"><div><h3>Distribusi Status</h3><p>Persentase permohonan berdasarkan status</p></div></div>' +
            '<div class="progress-list">' + progress.map(function (p) {
              const pct = Math.round((p.value / total) * 100);
              return '<div class="progress-item"><div class="progress-item__top"><strong>' + App.h(p.label) +
                "</strong><span>" + p.value + " (" + pct + "%)</span></div>" +
                '<div class="progress-track"><div class="progress-fill" style="width:' + pct + "%;background:" + p.tone + '"></div></div></div>';
            }).join("") + "</div></div>" +
        "</div>";
    },

    mount(root) {
      const btn = root.querySelector("#refresh-chart");
      if (btn) btn.addEventListener("click", function () {
        App.toast("Grafik diperbarui", "Data statistik berhasil dimuat ulang.", "success");
        App.Layout.refresh();
      });
    }
  };
})();
