/* ==========================================================================
   pages/uploads.js — Upload, preview, download, hapus file hasil
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  const ALLOWED = ["pdf", "doc", "docx", "jpg", "jpeg"];

  function extension(name) { return (name.split(".").pop() || "").toLowerCase(); }

  function downloadFile(f) {
    if (f.content) {
      const a = document.createElement("a");
      a.href = f.content;
      a.download = f.name;
      document.body.appendChild(a); a.click(); a.remove();
      App.toast("Unduhan", "File " + f.name + " sedang diunduh.", "info");
    } else {
      App.download("Simulasi file hasil: " + f.name + "\nUkuran: " + App.fmtBytes(f.size), f.name + ".txt", "text/plain");
      App.toast("Unduhan", "Simulasi unduhan file " + f.name + ".", "info");
    }
  }

  App.Pages.uploads = {
    title: "Upload File Hasil",
    subtitle: "Kelola file hasil permohonan",

    render() {
      const state = App.Store.get();
      const files = state.resultFiles.slice().sort(function (a, b) { return new Date(b.uploadedAt) - new Date(a.uploadedAt); });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Upload File Hasil</h2>' +
        '<p>' + files.length + " file hasil tersimpan · Format didukung: PDF, DOC, DOCX, JPG</p></div></div>" +

        '<div class="dashboard-grid" style="grid-template-columns:minmax(320px,.9fr) minmax(0,1.1fr)">' +
          '<div class="card"><div class="card__head"><div><h3>Unggah File Baru</h3><p>Lampirkan hasil pemrosesan permohonan</p></div></div>' +
            '<div class="card__body">' +
              '<div class="field"><label>Permohonan <span class="required">*</span></label>' +
                '<select class="select" id="upload-request">' +
                  state.requests.map(function (r) {
                    return '<option value="' + App.h(r.id) + '">' + App.h(r.id) + " — " + App.h(r.applicant) + " (" + App.h(r.status) + ")</option>";
                  }).join("") +
                "</select></div>" +
              '<div class="field"><label>Hak akses <span class="required">*</span></label>' +
                '<select class="select" id="upload-access"><option value="Pemohon">Pemohon (dapat diakses pengguna)</option><option value="Internal">Internal saja</option></select></div>' +
              '<label class="dropzone" id="dropzone">' +
                '<input type="file" id="upload-file" accept=".pdf,.doc,.docx,.jpg,.jpeg">' +
                '<span class="dropzone__icon">' + App.icon("upload") + "</span>" +
                '<strong id="dropzone-title">Klik untuk memilih atau tarik file ke sini</strong>' +
                "<span>PDF, DOC, DOCX, JPG · Maksimal 10 MB</span>" +
              "</label>" +
              '<div class="form-error" id="upload-error"></div>' +
              '<button class="btn btn--primary btn--block" type="button" id="upload-submit">' + App.icon("upload") + "Unggah File</button>" +
            "</div></div>" +

          '<div class="card"><div class="card__head"><div><h3>Daftar File Hasil</h3><p>File dapat dipreview, diunduh, atau dihapus</p></div>' +
            App.badge(files.length + " file", "blue") + "</div>" +
            '<div class="card__body">' + (files.length ? files.map(function (f) {
              const req = state.requests.find(function (r) { return r.id === f.requestId; });
              return '<div class="file-card"><span class="file-card__icon">' + App.icon(extension(f.name) === "jpg" || extension(f.name) === "jpeg" ? "fileImage" : "file") + "</span>" +
                '<span class="file-card__meta"><strong>' + App.h(f.name) + "</strong>" +
                "<span>" + App.fmtBytes(f.size) + " · " + App.fmtDateTime(f.uploadedAt) + " · " + App.h(f.requestId) +
                (req ? " (" + App.h(req.applicant) + ")" : "") + " · Akses: " + App.h(f.access) + "</span></span>" +
                '<span class="file-card__actions">' +
                  '<button class="icon-btn-table" type="button" data-preview="' + App.h(f.id) + '" title="Preview">' + App.icon("eye") + "</button>" +
                  '<button class="icon-btn-table" type="button" data-download="' + App.h(f.id) + '" title="Unduh">' + App.icon("download") + "</button>" +
                  '<button class="icon-btn-table icon-btn-table--danger" type="button" data-delete-file="' + App.h(f.id) + '" title="Hapus">' + App.icon("trash") + "</button>" +
                "</span></div>";
            }).join("") : App.empty("Belum ada file", "Unggah file hasil pertama di samping.", "upload")) +
          "</div></div>" +
        "</div>";
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.uploads.render());
        App.Pages.uploads.mount(document.getElementById("page-content"));
      }

      let chosen = null;
      const input = root.querySelector("#upload-file");
      const zone = root.querySelector("#dropzone");
      const title = root.querySelector("#dropzone-title");
      const error = root.querySelector("#upload-error");

      function pick(file) {
        if (!file) return;
        const ext = extension(file.name);
        if (ALLOWED.indexOf(ext) === -1) {
          error.textContent = "Format tidak didukung. Gunakan PDF, DOC, DOCX, atau JPG.";
          chosen = null; title.textContent = "Klik untuk memilih atau tarik file ke sini";
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          error.textContent = "Ukuran file maksimal 10 MB.";
          chosen = null; title.textContent = "Klik untuk memilih atau tarik file ke sini";
          return;
        }
        error.textContent = "";
        chosen = file;
        title.textContent = file.name + " · " + App.fmtBytes(file.size);
      }

      input.addEventListener("change", function (e) { pick(e.target.files[0]); });
      ["dragenter", "dragover"].forEach(function (evt) {
        zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.add("dragover"); });
      });
      ["dragleave", "drop"].forEach(function (evt) {
        zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.remove("dragover"); });
      });
      zone.addEventListener("drop", function (e) { pick(e.dataTransfer.files[0]); });

      root.querySelector("#upload-submit").addEventListener("click", function () {
        const requestId = root.querySelector("#upload-request").value;
        const access = root.querySelector("#upload-access").value;
        if (!chosen) { error.textContent = "Pilih file terlebih dahulu."; return; }

        function save(content) {
          const id = App.Store.uid("FILE");
          App.Store.update(function (s) {
            s.resultFiles.unshift({
              id, requestId, name: chosen.name, size: chosen.size,
              type: chosen.type || "application/" + extension(chosen.name),
              access, uploadedAt: new Date().toISOString(), uploadedBy: App.Auth.displayName(), content
            });
            const r = s.requests.find(function (x) { return x.id === requestId; });
            if (r) {
              r.resultFileIds = (r.resultFileIds || []).concat([id]);
              r.updatedAt = new Date().toISOString();
              if (r.status !== "Ditolak") {
                r.status = "Selesai";
                r.history.push({ at: new Date().toISOString(), text: "Data hasil tersedia untuk pemohon", status: "Selesai", actor: App.Auth.displayName() });
                App.Store.notify(s, r.userId, "Data selesai disiapkan", "Data hasil permohonan " + r.id + " telah tersedia untuk diunduh.", "success", r.id);
              }
              r.history.push({ at: new Date().toISOString(), text: "File hasil diunggah: " + chosen.name, actor: App.Auth.displayName() });
            }
            App.Store.log(s, "Upload", "Mengunggah " + id + " untuk " + requestId);
          });
          App.toast("Berhasil", "File hasil berhasil diunggah.", "success");
          App.Layout.refresh();
          rerender();
        }

        if (chosen.size <= 2 * 1024 * 1024 && chosen.type.indexOf("image/") === 0) {
          const reader = new FileReader();
          reader.onload = function () { save(reader.result); };
          reader.onerror = function () { App.toast("Gagal", "File tidak dapat dibaca.", "error"); };
          reader.readAsDataURL(chosen);
        } else {
          save(null);
          if (chosen.size > 2 * 1024 * 1024) {
            App.toast("Info", "File besar disimpan sebagai metadata; pratinjau penuh tidak tersedia.", "info");
          }
        }
      });

      root.querySelectorAll("[data-preview]").forEach(function (b) {
        b.addEventListener("click", function () {
          const state = App.Store.get();
          const f = state.resultFiles.find(function (x) { return x.id === b.dataset.preview; });
          if (!f) return;
          const req = state.requests.find(function (r) { return r.id === f.requestId; });
          let preview;
          if (f.content && f.type.indexOf("image/") === 0) {
            preview = '<img src="' + f.content + '" alt="Preview" style="max-width:100%;border-radius:10px;border:1px solid var(--slate-200)">';
          } else if (f.content) {
            preview = '<iframe src="' + f.content + '" title="Preview PDF" style="width:100%;height:380px;border:1px solid var(--slate-200);border-radius:10px"></iframe>';
          } else {
            preview = '<div class="note-box note-box--green"><strong>Pratinjau simulasi</strong><p style="margin:6px 0 0">Dokumen hasil untuk ' +
              App.h(f.requestId) + " (" + App.h(req ? req.applicant : "-") + "). Isi file tidak disimpan di browser untuk menjaga ukuran penyimpanan.</p></div>";
          }
          App.modal({
            title: "Preview File",
            subtitle: f.name,
            wide: true,
            confirmText: "Unduh",
            cancelText: "Tutup",
            body: preview + '<div class="info-grid" style="margin-top:16px">' +
              '<div class="info-item"><label>Ukuran</label><div>' + App.fmtBytes(f.size) + "</div></div>" +
              '<div class="info-item"><label>Tanggal upload</label><div>' + App.fmtDateTime(f.uploadedAt) + "</div></div>" +
              '<div class="info-item"><label>Diunggah oleh</label><div>' + App.h(f.uploadedBy) + "</div></div>" +
              '<div class="info-item"><label>Akses</label><div>' + App.h(f.access) + "</div></div></div>",
            onConfirm() { downloadFile(f); }
          });
        });
      });

      root.querySelectorAll("[data-download]").forEach(function (b) {
        b.addEventListener("click", function () {
          const f = App.Store.get().resultFiles.find(function (x) { return x.id === b.dataset.download; });
          if (f) downloadFile(f);
        });
      });

      root.querySelectorAll("[data-delete-file]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.deleteFile;
          App.confirm("Hapus file", "File hasil akan dihapus dari daftar. Permohonan terkait tetap tersimpan.", function () {
            App.Store.update(function (s) {
              const f = s.resultFiles.find(function (x) { return x.id === id; });
              s.resultFiles = s.resultFiles.filter(function (x) { return x.id !== id; });
              s.requests.forEach(function (r) { if ((r.resultFileIds || []).indexOf(id) !== -1) r.resultFileIds = r.resultFileIds.filter(function (x) { return x !== id; }); });
              App.Store.log(s, "Penghapusan", "Menghapus file hasil " + (f ? f.name : id));
            });
            App.toast("Berhasil", "File hasil dihapus.", "success");
            rerender();
          }, { confirmText: "Ya, hapus" });
        });
      });
    }
  };
})();
