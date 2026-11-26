/* ==========================================================================
   applicant/detail.js — Detail permohonan, timeline, revisi, dan unduhan hasil
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  function info(label, value, full) {
    return '<div class="info-item' + (full ? " info-item--full" : "") + '"><label>' + App.h(label) + "</label><div>" + App.h(value || "—") + "</div></div>";
  }

  function downloadFile(f) {
    if (f.content && f.type.indexOf("image/") === 0) {
      const a = document.createElement("a");
      a.href = f.content; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
    } else {
      App.download(f.content || ("Dokumen hasil SIRADA BBWS\nPermohonan: " + f.requestId + "\nNama file: " + f.name), f.name + (f.content ? "" : ".txt"), f.content ? "application/octet-stream" : "text/plain");
    }
    App.toast("Unduhan", "File " + f.name + " sedang diunduh.", "info");
  }

  App.ApplicantPages.detail = {
    title: "Detail Permohonan",
    subtitle: "Informasi lengkap dan tracking status",

    render(param) {
      const user = App.Auth.currentUser();
      const state = App.Store.get();
      const id = param ? decodeURIComponent(param) : null;
      const r = state.requests.find(function (x) { return x.id === id && x.userId === user.id; });

      if (!r) {
        return '<div class="card">' + App.empty("Permohonan tidak ditemukan", "Permohonan ini tidak tersedia untuk akun Anda.", "alertCircle") +
          '<div style="text-align:center;margin-top:16px"><a class="btn btn--primary" href="#/saya/permohonan">Kembali ke daftar</a></div></div>';
      }

      const cat = App.category(r.categoryId);
      const results = state.resultFiles.filter(function (f) { return f.requestId === r.id && f.access === "Pemohon"; });
      const history = (r.history || []).slice().reverse();
      const canRevise = r.status === "Perlu Perbaikan";

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>' + App.h(r.id) + "</h2>" +
          "<p>" + App.h(r.subject) + " · Diajukan " + App.fmtDateTime(r.submittedAt) + "</p></div>" +
          '<div class="page-toolbar__actions">' + App.statusBadge(r.status) +
            '<a class="btn btn--outline" href="#/saya/permohonan">' + App.icon("arrowLeft") + "Kembali</a></div></div>" +

          (canRevise ? '<div class="notice-banner notice-banner--warning"><span class="notice-banner__icon">' + App.icon("alert") + "</span>" +
            '<div><strong>Dokumen Anda perlu diperbaiki</strong><p>' + App.h(r.repairReason || r.notes || "Petugas meminta perbaikan dokumen.") + "</p></div>" +
            '<button class="btn btn--warning btn--sm" type="button" id="upload-revision">' + App.icon("upload") + "Unggah Perbaikan</button></div>" : "") +

          '<div class="detail-grid">' +
            '<div style="display:flex;flex-direction:column;gap:18px">' +
              '<div class="card"><div class="card__head"><div><h3>Informasi Permohonan</h3><p>Data yang diajukan kepada BBWS Bengawan Solo</p></div>' + App.statusBadge(r.status) + "</div>" +
                '<div class="card__body"><div class="info-grid">' +
                  info("Nomor Tiket", r.id) + info("Kategori Data", cat ? cat.name : "—") +
                  info("Judul Permohonan", r.subject, true) + info("Data yang Dibutuhkan", r.dataNeeded, true) +
                  info("Tujuan Penggunaan", r.purpose, true) + info("Detail Tambahan", r.detail, true) +
                  info("Tanggal Kebutuhan", r.neededAt ? App.fmtDate(r.neededAt) : "—") +
                  info("Tanggal Pengajuan", App.fmtDateTime(r.submittedAt)) +
                  info("Instansi", r.institution) + info("Nama Pemohon", r.applicant) +
                "</div></div></div>" +

              '<div class="card"><div class="card__head"><div><h3>Dokumen Permohonan</h3><p>' + r.documents.length + " dokumen terlampir</p></div></div>" +
                '<div class="card__body">' + (r.documents.length ? '<ul class="doc-list">' + r.documents.map(function (d) {
                  return '<li class="doc-item"><span class="doc-item__icon">' + App.icon(d.type && d.type.indexOf("image/") === 0 ? "fileImage" : "file") + "</span>" +
                    '<span class="doc-item__meta"><strong>' + App.h(d.name) + "</strong><span>" + App.h(d.kind || "Dokumen") + " · " + App.fmtBytes(d.size) + " · " + App.fmtDate(d.uploadedAt) + "</span></span>" +
                    '<button class="icon-btn-table" type="button" data-download-doc="' + App.h(d.id) + '" title="Unduh">' + App.icon("download") + "</button></li>";
                }).join("") + "</ul>" : App.empty("Belum ada dokumen", "Tidak ada dokumen pada permohonan ini.", "folder")) + "</div></div>" +

              (r.notes ? '<div class="card"><div class="card__body"><div class="note-box"><strong>Catatan petugas:</strong><p style="margin:5px 0 0">' + App.h(r.notes) + "</p></div></div></div>" : "") +
            "</div>" +

            '<div style="display:flex;flex-direction:column;gap:18px">' +
              '<div class="card"><div class="card__head"><h3>Tracking Status</h3>' + App.badge(r.status) + "</div>" +
                '<div class="card__body"><ul class="timeline timeline--detailed">' + history.map(function (h, i) {
                  return '<li class="' + (i === 0 ? "current" : "") + '"><strong>' + App.h(h.text) + "</strong>" +
                    (h.status ? App.statusBadge(h.status) : "") +
                    "<span>" + App.fmtDateTime(h.at) + (h.actor ? " · " + App.h(h.actor) : "") + "</span></li>";
                }).join("") + "</ul></div></div>" +

              '<div class="card"><div class="card__head"><h3>Data Hasil</h3>' + App.badge(results.length + " file", "blue") + "</div>" +
                '<div class="card__body">' + (results.length ? results.map(function (f) {
                  return '<div class="file-card"><span class="file-card__icon">' + App.icon("fileCheck") + "</span>" +
                    '<span class="file-card__meta"><strong>' + App.h(f.name) + "</strong><span>" + App.fmtBytes(f.size) + " · " + App.fmtDateTime(f.uploadedAt) + "</span></span>" +
                    '<button class="icon-btn-table" type="button" data-download-result="' + App.h(f.id) + '" title="Unduh">' + App.icon("download") + "</button></div>";
                }).join("") : '<div class="note-box">' + (r.status === "Selesai" ? "File hasil belum tersedia. Hubungi petugas jika diperlukan." : "Data hasil tersedia setelah permohonan dinyatakan Selesai.") + "</div>") + "</div></div>" +

              '<div class="card"><div class="card__head"><h3>Bantuan</h3></div><div class="card__body">' +
                '<p class="muted">Butuh informasi mengenai alur permohonan atau ketentuan dokumen?</p>' +
                '<a class="btn btn--outline btn--block" href="#/panduan">' + App.icon("book") + "Baca Panduan Permohonan</a>" +
              "</div></div>" +
            "</div>" +
          "</div>";
    },

    mount(root, param) {
      const user = App.Auth.currentUser();
      const id = param ? decodeURIComponent(param) : null;
      const r = App.Store.get().requests.find(function (x) { return x.id === id && x.userId === user.id; });
      if (!r) return;

      root.querySelectorAll("[data-download-doc]").forEach(function (b) {
        b.addEventListener("click", function () {
          const d = r.documents.find(function (x) { return x.id === b.dataset.downloadDoc; });
          if (d) downloadFile(d);
        });
      });
      root.querySelectorAll("[data-download-result]").forEach(function (b) {
        b.addEventListener("click", function () {
          const f = App.Store.get().resultFiles.find(function (x) { return x.id === b.dataset.downloadResult; });
          if (f) downloadFile(f);
        });
      });

      const revise = root.querySelector("#upload-revision");
      if (revise) revise.addEventListener("click", function () {
        App.modal({
          title: "Unggah Dokumen Perbaikan",
          subtitle: r.id,
          confirmText: "Kirim perbaikan",
          body: '<p class="modal__message">Unggah ulang dokumen yang diminta petugas. Catatan: <b>' + App.h(r.repairReason || r.notes || "-") + "</b></p>" +
            '<div class="field"><label>File perbaikan <span class="required">*</span></label><input class="input" type="file" id="revision-file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple></div>' +
            '<div class="field"><label>Keterangan perbaikan</label><textarea class="textarea" id="revision-note" placeholder="Jelaskan perubahan yang Anda lakukan…"></textarea></div>' +
            '<div class="form-error" id="revision-error"></div>',
          onConfirm: async function (modal) {
            const input = modal.querySelector("#revision-file");
            const note = modal.querySelector("#revision-note").value.trim();
            const err = modal.querySelector("#revision-error");
            const files = Array.from(input.files || []);
            if (!files.length) { err.textContent = "Pilih minimal satu file perbaikan."; return false; }
            for (let i = 0; i < files.length; i++) {
              if (files[i].size > 10 * 1024 * 1024) { err.textContent = "Ukuran setiap file maksimal 10 MB."; return false; }
            }
            const docs = [];
            for (let i = 0; i < files.length; i++) {
              const content = files[i].size <= 2 * 1024 * 1024 && files[i].type.indexOf("image/") === 0 ? await App.readFile(files[i]) : null;
              docs.push({ id: App.Store.uid("DOC"), name: files[i].name, size: files[i].size, type: files[i].type || "application/octet-stream", kind: "Dokumen revisi", uploadedAt: new Date().toISOString(), content });
            }
            App.Store.update(function (s) {
              const req = s.requests.find(function (x) { return x.id === r.id; });
              req.documents = req.documents.concat(docs);
              req.repairReason = "";
            });
            App.changeStatus(r.id, "Menunggu Verifikasi", "Pemohon mengunggah perbaikan" + (note ? ": " + note : ""), user.name);
            App.toast("Berhasil", "Perbaikan terkirim. Permohonan kembali diverifikasi petugas.", "success");
            App.Layout.refresh();
            App.Layout.setContent(App.ApplicantPages.detail.render(r.id));
            App.ApplicantPages.detail.mount(document.getElementById("page-content"), r.id);
          }
        });
      });
    }
  };
})();
