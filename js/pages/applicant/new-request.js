/* ==========================================================================
   applicant/new-request.js — Formulir pengajuan permohonan data pemohon
   ========================================================================== */
(function () {
  App.ApplicantPages = App.ApplicantPages || {};

  const ALLOWED = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
  const MAX_SIZE = 10 * 1024 * 1024;
  const stateFiles = { letter: null, supporting: [] };

  function ext(name) { return (name.split(".").pop() || "").toLowerCase(); }

  function fileRows() {
    const letter = stateFiles.letter ?
      '<li class="doc-item"><span class="doc-item__icon">' + App.icon("fileCheck") + "</span><span class=\"doc-item__meta\"><strong>" + App.h(stateFiles.letter.name) + "</strong><span>" + App.fmtBytes(stateFiles.letter.size) + " · Surat permohonan</span></span>" +
      '<button class="icon-btn-table icon-btn-table--danger" type="button" data-remove-letter>' + App.icon("x") + "</button></li>" : "";
    const supporting = stateFiles.supporting.map(function (f, i) {
      return '<li class="doc-item"><span class="doc-item__icon">' + App.icon("file") + "</span><span class=\"doc-item__meta\"><strong>" + App.h(f.name) + "</strong><span>" + App.fmtBytes(f.size) + " · Dokumen pendukung</span></span>" +
        '<button class="icon-btn-table icon-btn-table--danger" type="button" data-remove-support="' + i + '">' + App.icon("x") + "</button></li>";
    }).join("");
    return '<ul class="doc-list">' + letter + supporting + "</ul>";
  }

  App.ApplicantPages.baru = {
    title: "Buat Permohonan",
    subtitle: "Ajukan permohonan data baru",

    render(param, query) {
      const state = App.Store.get();
      const user = App.Auth.currentUser();
      const preset = query && query.kategori ? query.kategori : "";
      stateFiles.letter = null;
      stateFiles.supporting = [];
      const today = new Date().toISOString().slice(0, 10);

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Formulir Permohonan Data</h2>' +
          '<p>Lengkapi seluruh informasi berikut dengan benar. Kolom bertanda <span class="required">*</span> wajib diisi.</p></div>' +
          '<div class="page-toolbar__actions"><a class="btn btn--outline" href="#/saya/permohonan">' + App.icon("arrowLeft") + "Kembali</a></div></div>" +

          '<form id="request-form" class="request-form" novalidate>' +
            '<div class="request-form__grid">' +
              '<div style="display:flex;flex-direction:column;gap:18px">' +
                '<div class="card"><div class="card__head"><div><h3>Data Pemohon</h3><p>Informasi ini diambil otomatis dari profil Anda</p></div>' + App.icon("user", "head-icon") + "</div>" +
                  '<div class="card__body"><div class="field-row">' +
                    '<div class="field"><label>Nama Lengkap</label><input class="input input--readOnly" value="' + App.h(user.name) + '" readonly></div>' +
                    '<div class="field"><label>Email</label><input class="input input--readOnly" value="' + App.h(user.email) + '" readonly></div>' +
                  "</div><div class=\"field-row\">" +
                    '<div class="field"><label>Jenis Pemohon</label><input class="input input--readOnly" value="' + App.h(user.applicantType) + '" readonly></div>' +
                    '<div class="field"><label>Instansi <span class="required">*</span></label><input class="input" id="rf-institution" placeholder="Nama instansi / lembaga (isi - jika tidak ada)" value="' + App.h(user.institution && user.institution !== "-" ? user.institution : "") + '"></div>' +
                  "</div><div class=\"field-row\">" +
                    '<div class="field"><label>Nomor Telepon</label><input class="input input--readOnly" value="' + App.h(user.phone || "-") + '" readonly></div>' +
                    '<div class="field"><label>Tanggal Kebutuhan Data <span class="required">*</span></label><input class="input" id="rf-needed" type="date" min="' + today + '"></div>' +
                  "</div></div></div>" +

                '<div class="card"><div class="card__head"><div><h3>Detail Permohonan</h3><p>Jelaskan data yang Anda butuhkan</p></div>' + App.icon("clipboard", "head-icon") + "</div>" +
                  '<div class="card__body">' +
                    '<div class="field"><label>Kategori Data <span class="required">*</span></label><select class="select" id="rf-category"><option value="">Pilih kategori data…</option>' +
                      state.categories.filter(function (c) { return c.active; }).map(function (c) {
                        return '<option value="' + App.h(c.id) + '" ' + (preset === c.id ? "selected" : "") + ">" + App.h(c.name) + " · " + App.h(c.code) + "</option>";
                      }).join("") + "</select></div>" +
                    '<div class="field"><label>Judul Permohonan <span class="required">*</span></label><input class="input" id="rf-subject" placeholder="Contoh: Data debit Sungai Bengawan Solo 2021-2025"></div>' +
                    '<div class="field"><label>Data yang Dibutuhkan <span class="required">*</span></label><textarea class="textarea" id="rf-data" placeholder="Sebutkan jenis data, periode, lokasi, dan format yang dibutuhkan…"></textarea></div>' +
                    '<div class="field"><label>Tujuan Penggunaan Data <span class="required">*</span></label><textarea class="textarea" id="rf-purpose" placeholder="Jelaskan tujuan penggunaan data secara spesifik…"></textarea></div>' +
                    '<div class="field"><label>Detail / Keterangan Tambahan</label><textarea class="textarea" id="rf-detail" placeholder="Informasi tambahan yang perlu diketahui petugas (opsional)"></textarea></div>' +
                  "</div></div>" +
              "</div>" +

              '<div style="display:flex;flex-direction:column;gap:18px">' +
                '<div class="card"><div class="card__head"><div><h3>Dokumen Persyaratan</h3><p>PDF, DOC, DOCX, JPG, PNG · Maks. 10 MB per file</p></div>' + App.icon("upload", "head-icon") + "</div>" +
                  '<div class="card__body">' +
                    '<div class="field"><label>Surat Permohonan <span class="required">*</span></label>' +
                      '<label class="dropzone" id="dz-letter"><input type="file" id="file-letter" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">' +
                        '<span class="dropzone__icon">' + App.icon("upload") + "</span><strong id=\"dz-letter-title\">Klik atau tarik surat permohonan ke sini</strong><span>Surat bermeterai ditujukan kepada Kepala BBWS Bengawan Solo</span></label></div>" +
                    '<div class="field"><label>Dokumen Pendukung</label>' +
                      '<label class="dropzone dropzone--sm" id="dz-support"><input type="file" id="file-support" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple>' +
                        '<span class="dropzone__icon">' + App.icon("folder") + "</span><strong>Tambahkan dokumen pendukung</strong><span>KTP, KTM, surat instansi, atau dokumen lain (boleh lebih dari satu)</span></label></div>" +
                    '<div id="file-list">' + fileRows() + "</div>" +
                  "</div></div>" +

                '<div class="card"><div class="card__head"><h3>Ringkasan Pengajuan</h3></div><div class="card__body">' +
                  '<div class="summary-box"><div><span>Kategori</span><strong id="sum-category">—</strong></div>' +
                  '<div><span>Judul</span><strong id="sum-subject">—</strong></div>' +
                  '<div><span>Tanggal kebutuhan</span><strong id="sum-needed">—</strong></div>' +
                  '<div><span>Jumlah dokumen</span><strong id="sum-docs">0 file</strong></div></div>' +
                  '<div class="form-error" id="rf-error"></div>' +
                  '<button class="btn btn--primary btn--block btn--lg" type="submit">' + App.icon("send") + "Kirim Permohonan</button>" +
                  '<p class="form-hint">Dengan mengirim, Anda menyatakan bahwa data yang diberikan benar dan akan digunakan sesuai tujuan.</p>' +
                "</div></div>" +
              "</div>" +
            "</div>" +
          "</form>";
    },

    mount(root) {
      const user = App.Auth.currentUser();
      const state = App.Store.get();
      const q = function (id) { return root.querySelector(id); };
      const errorBox = q("#rf-error");

      function validateFile(file) {
        if (!file) return null;
        if (ALLOWED.indexOf(ext(file.name)) === -1) return "Format tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG.";
        if (file.size > MAX_SIZE) return "Ukuran file maksimal 10 MB.";
        return null;
      }

      function updateSummary() {
        const catId = q("#rf-category").value;
        const cat = state.categories.find(function (c) { return c.id === catId; });
        q("#sum-category").textContent = cat ? cat.name : "—";
        q("#sum-subject").textContent = q("#rf-subject").value.trim() || "—";
        q("#sum-needed").textContent = q("#rf-needed").value ? App.fmtDate(q("#rf-needed").value) : "—";
        q("#sum-docs").textContent = (stateFiles.letter ? 1 : 0) + stateFiles.supporting.length + " file";
      }

      function refreshFiles() {
        q("#file-list").innerHTML = fileRows();
        q("#dz-letter-title").textContent = stateFiles.letter ? stateFiles.letter.name + " · " + App.fmtBytes(stateFiles.letter.size) : "Klik atau tarik surat permohonan ke sini";
        q("[data-remove-letter]") && q("[data-remove-letter]").addEventListener("click", function () { stateFiles.letter = null; refreshFiles(); });
        root.querySelectorAll("[data-remove-support]").forEach(function (b) {
          b.addEventListener("click", function () { stateFiles.supporting.splice(Number(b.dataset.removeSupport), 1); refreshFiles(); });
        });
        updateSummary();
      }

      function bindDrop(zoneId, inputId, multiple) {
        const input = q(inputId);
        const zone = q(zoneId);
        function add(files) {
          let message = "";
          Array.from(files || []).forEach(function (file) {
            const problem = validateFile(file);
            if (problem) { message = problem; return; }
            if (multiple) stateFiles.supporting.push(file);
            else stateFiles.letter = file;
          });
          errorBox.textContent = message;
          refreshFiles();
        }
        input.addEventListener("change", function (e) { add(e.target.files); input.value = ""; });
        ["dragenter", "dragover"].forEach(function (evt) {
          zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.add("dragover"); });
        });
        ["dragleave", "drop"].forEach(function (evt) {
          zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.remove("dragover"); });
        });
        zone.addEventListener("drop", function (e) { add(e.dataTransfer.files); });
      }

      bindDrop("#dz-letter", "#file-letter", false);
      bindDrop("#dz-support", "#file-support", true);
      ["#rf-category", "#rf-subject", "#rf-needed"].forEach(function (id) {
        q(id).addEventListener("input", updateSummary);
        q(id).addEventListener("change", updateSummary);
      });
      updateSummary();

      q("#request-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const get = function (id) { return q(id).value.trim(); };
        const payload = {
          institution: get("#rf-institution"), neededAt: get("#rf-needed"),
          categoryId: get("#rf-category"), subject: get("#rf-subject"),
          dataNeeded: get("#rf-data"), purpose: get("#rf-purpose"), detail: get("#rf-detail")
        };
        if (!payload.institution) { errorBox.textContent = "Instansi wajib diisi (gunakan '-' bila tidak ada)."; q("#rf-institution").focus(); return; }
        if (!payload.categoryId) { errorBox.textContent = "Pilih kategori data terlebih dahulu."; q("#rf-category").focus(); return; }
        if (!payload.subject) { errorBox.textContent = "Judul permohonan wajib diisi."; q("#rf-subject").focus(); return; }
        if (!payload.dataNeeded) { errorBox.textContent = "Jelaskan data yang dibutuhkan."; q("#rf-data").focus(); return; }
        if (payload.purpose.length < 10) { errorBox.textContent = "Tujuan penggunaan data minimal 10 karakter."; q("#rf-purpose").focus(); return; }
        if (!payload.neededAt) { errorBox.textContent = "Tanggal kebutuhan data wajib diisi."; q("#rf-needed").focus(); return; }
        if (!stateFiles.letter) { errorBox.textContent = "Surat permohonan wajib diunggah."; return; }
        errorBox.textContent = "";

        App.modal({
          title: "Konfirmasi Pengiriman",
          subtitle: "Periksa kembali permohonan Anda",
          confirmText: "Ya, kirim permohonan",
          body: '<div class="summary-box"><div><span>Nomor tiket</span><strong>Akan dibuat otomatis</strong></div>' +
            '<div><span>Kategori</span><strong>' + App.h(App.category(payload.categoryId).name) + "</strong></div>" +
            '<div><span>Judul</span><strong>' + App.h(payload.subject) + "</strong></div>" +
            '<div><span>Dokumen terlampir</span><strong>' + ((stateFiles.letter ? 1 : 0) + stateFiles.supporting.length) + " file</strong></div></div>" +
            '<p class="modal__message">Setelah dikirim, status awal permohonan adalah <b>Diajukan</b> dan Anda akan menerima nomor tiket unik.</p>',
          onConfirm: async function () {
            const docs = [];
            const prepare = async function (file, kind) {
              if (!file) return;
              const content = file.size <= 2 * 1024 * 1024 && file.type.indexOf("image/") === 0 ? await App.readFile(file) : null;
              docs.push({ id: App.Store.uid("DOC"), name: file.name, size: file.size, type: file.type || "application/octet-stream", kind, uploadedAt: new Date().toISOString(), content });
            };
            await prepare(stateFiles.letter, "Surat permohonan");
            for (let i = 0; i < stateFiles.supporting.length; i++) await prepare(stateFiles.supporting[i], "Dokumen pendukung");

            let ticket = "";
            App.Store.update(function (s) {
              ticket = App.Store.nextTicket(s);
              const at = new Date().toISOString();
              s.requests.unshift({
                id: ticket, userId: user.id, applicant: user.name, email: user.email,
                phone: user.phone || "-", nik: user.nik || "-", institution: payload.institution,
                applicantType: user.applicantType, address: user.address || "-",
                categoryId: payload.categoryId, subject: payload.subject, dataNeeded: payload.dataNeeded,
                purpose: payload.purpose, detail: payload.detail, neededAt: payload.neededAt,
                submittedAt: at, status: "Diajukan", documents: docs, notes: "", repairReason: "",
                verification: { checked: false, complete: false, note: "", checkedBy: "", checkedAt: "", checks: {} },
                resultFileIds: [], updatedAt: at,
                history: [{ at, text: "Permohonan berhasil dikirim oleh pemohon", status: "Diajukan", actor: user.name }]
              });
              App.Store.notify(s, user.id, "Permohonan berhasil dikirim",
                "Permohonan dengan nomor tiket " + ticket + " berhasil dikirim dan menunggu verifikasi.", "success", ticket);
              App.Store.log(s, "Permohonan", "Permohonan baru " + ticket + " dari " + user.name, user.name);
            });
            stateFiles.letter = null; stateFiles.supporting = [];
            App.toast("Berhasil", "Permohonan terkirim. Nomor tiket: " + ticket, "success");
            location.hash = "#/saya/detail/" + encodeURIComponent(ticket);
          }
        });
      });
    }
  };
})();
