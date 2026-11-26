/* ==========================================================================
   pages/detail.js — Detail lengkap permohonan + aksi verifikasi/penolakan
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  let selectedId = null;

  function current(param) {
    const state = App.Store.get();
    if (param) {
      selectedId = decodeURIComponent(param);
    }
    if (!selectedId || !state.requests.some(function (r) { return r.id === selectedId; })) {
      selectedId = state.requests.length ? state.requests[0].id : null;
    }
    return { state, request: state.requests.find(function (r) { return r.id === selectedId; }) || null };
  }

  function info(label, value, full) {
    return '<div class="info-item' + (full ? " info-item--full" : "") + '"><label>' + App.h(label) + "</label><div>" + App.h(value || "—") + "</div></div>";
  }

  App.Pages.detail = {
    title: "Detail Permohonan",
    subtitle: "Lihat informasi lengkap sebuah permohonan",

    render(param) {
      const { state, request } = current(param);

      if (!request) {
        return '<div class="card">' + App.empty("Belum ada permohonan", "Tambahkan permohonan terlebih dahulu.", "file") + "</div>";
      }

      const cat = state.categories.find(function (c) { return c.id === request.categoryId; });
      const resultFile = state.resultFiles.find(function (f) { return (request.resultFileIds || []).indexOf(f.id) !== -1; });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Detail ' + App.h(request.id) + "</h2>" +
        '<p>Diajukan ' + App.fmtDateTime(request.submittedAt) + " · " + App.h(request.subject) + "</p></div>" +
        '<div class="page-toolbar__actions">' +
          '<select class="select" id="detail-select" style="min-width:230px">' +
            state.requests.map(function (r) {
              return '<option value="' + App.h(r.id) + '" ' + (r.id === request.id ? "selected" : "") + ">" + App.h(r.id) + " — " + App.h(r.applicant) + "</option>";
            }).join("") +
          "</select>" +
          '<a class="btn btn--outline" href="#/admin/requests">' + App.icon("files") + "Daftar</a>" +
        "</div></div>" +

        '<div class="detail-grid">' +
          '<div style="display:flex;flex-direction:column;gap:18px">' +
            '<div class="card"><div class="card__head"><div><h3>Data Pemohon</h3><p>Informasi identitas dan kontak pemohon</p></div>' +
              App.statusBadge(request.status) + "</div>" +
              '<div class="card__body"><div class="info-grid">' +
                info("Nama Lengkap", request.applicant) +
                info("Email", request.email) +
                info("Nomor HP", request.phone) +
                info("Jenis Pemohon", request.applicantType) +
                info("Instansi", request.institution) +
                info("Kategori Data", cat ? cat.name : "—") +
                info("Alamat", request.address, true) +
              "</div></div></div>" +

            '<div class="card"><div class="card__head"><div><h3>Data Permohonan</h3><p>Detail dan dokumen persyaratan</p></div></div>' +
              '<div class="card__body"><div class="info-grid">' +
                info("Kode Permohonan", request.id) +
                info("Subjek", request.subject, true) +
                info("Tanggal Pengajuan", App.fmtDateTime(request.submittedAt)) +
                info("Terakhir Diperbarui", App.fmtDateTime(request.updatedAt)) +
              "</div>" +
              '<div class="divider"></div>' +
              '<h4 class="section-title">' + App.icon("folder") + "Dokumen Persyaratan</h4>" +
              (request.documents.length ? '<ul class="doc-list">' + request.documents.map(function (d) {
                return '<li class="doc-item"><span class="doc-item__icon">' + App.icon(d.type === "image/jpeg" ? "fileImage" : "file") + "</span>" +
                  '<span class="doc-item__meta"><strong>' + App.h(d.name) + "</strong><span>" + App.fmtBytes(d.size) + " · " + App.fmtDate(d.uploadedAt) + "</span></span>" +
                  '<button class="icon-btn-table" type="button" data-doc="' + App.h(d.name) + '" title="Simulasikan unduhan">' + App.icon("download") + "</button></li>";
              }).join("") + "</ul>" : App.empty("Belum ada dokumen", "Pemohon belum mengunggah dokumen persyaratan.", "folder")) +
              "</div></div>" +

            (request.repairReason ? '<div class="card"><div class="card__body"><div class="note-box">' +
              "<strong>Alasan perlu perbaikan:</strong><p style='margin:5px 0 0'>" + App.h(request.repairReason) + "</p></div></div></div>" : "") +
          "</div>" +

          '<div style="display:flex;flex-direction:column;gap:18px">' +
            '<div class="card"><div class="card__head"><h3>Status &amp; Tindakan</h3></div>' +
              '<div class="card__body">' +
                '<div style="margin-bottom:14px">' + App.statusBadge(request.status) + "</div>" +
                (request.notes ? '<div class="note-box" style="margin-bottom:14px"><strong>Catatan admin:</strong><p style="margin:5px 0 0">' + App.h(request.notes) + "</p></div>" : "") +
                '<div style="display:flex;flex-direction:column;gap:8px">' +
                  '<a class="btn btn--primary btn--block" href="#/admin/verification/' + encodeURIComponent(request.id) + '">' + App.icon("checkSquare") + "Buka Form Verifikasi</a>" +
                  '<button class="btn btn--danger btn--block" type="button" id="detail-reject">' + App.icon("x") + "Tolak Permohonan</button>" +
                  '<a class="btn btn--outline btn--block" href="#/admin/uploads">' + App.icon("upload") + "Upload File Hasil</a>" +
                "</div>" +
              "</div></div>" +

            '<div class="card"><div class="card__head"><h3>Hasil Permohonan</h3></div><div class="card__body">' +
              (resultFile ?
                '<div class="file-card"><span class="file-card__icon">' + App.icon("file") + "</span>" +
                '<span class="file-card__meta"><strong>' + App.h(resultFile.name) + "</strong><span>" + App.fmtBytes(resultFile.size) + " · " + App.fmtDate(resultFile.uploadedAt) + "</span></span>" +
                '<a class="icon-btn-table" href="#/admin/uploads" title="Kelola file">' + App.icon("external") + "</a></div>" :
                '<div class="note-box note-box--red">File hasil belum diunggah untuk permohonan ini.</div>') +
            "</div></div>" +

            '<div class="card"><div class="card__head"><h3>Riwayat Permohonan</h3></div><div class="card__body">' +
              '<ul class="timeline">' + (request.history || []).slice().reverse().map(function (h) {
                return "<li><strong>" + App.h(h.text) + "</strong><span>" + App.fmtDateTime(h.at) + "</span></li>";
              }).join("") + "</ul>" +
            "</div></div>" +
          "</div>" +
        "</div>";
    },

    mount(root, param) {
      current(param);
      const select = root.querySelector("#detail-select");
      if (select) select.addEventListener("change", function (e) {
        location.hash = "#/admin/detail/" + encodeURIComponent(e.target.value);
      });

      root.querySelectorAll("[data-doc]").forEach(function (b) {
        b.addEventListener("click", function () {
          App.download("Dokumen: " + b.dataset.doc, b.dataset.doc, "text/plain");
          App.toast("Unduhan", "Simulasi unduhan dokumen dimulai.", "info");
        });
      });

      const reject = root.querySelector("#detail-reject");
      if (reject) reject.addEventListener("click", function () {
        const id = selectedId;
        App.modal({
          title: "Tolak Permohonan",
          subtitle: id,
          confirmText: "Ya, tolak",
          body: '<div class="field"><label>Alasan penolakan <span class="required">*</span></label>' +
            '<textarea class="textarea" id="reject-note" placeholder="Jelaskan alasan penolakan secara jelas…"></textarea></div>' +
            '<div class="form-error" id="reject-error"></div>',
          onConfirm(modal) {
            const note = modal.querySelector("#reject-note").value.trim();
            if (!note) { modal.querySelector("#reject-error").textContent = "Alasan penolakan wajib diisi."; return false; }
            App.changeStatus(id, "Ditolak", note, App.Auth.displayName());
            App.Store.update(function (s) {
              const r = s.requests.find(function (x) { return x.id === id; });
              if (r) r.verification = { checked: true, complete: false, note, checkedBy: App.Auth.displayName(), checkedAt: new Date().toISOString(), checks: r.verification.checks || {} };
            });
            App.toast("Berhasil", "Permohonan " + id + " ditolak.", "success");
            App.Layout.refresh();
            App.Layout.setContent(App.Pages.detail.render(id));
            App.Pages.detail.mount(document.getElementById("page-content"), id);
          }
        });
      });
    }
  };
})();
