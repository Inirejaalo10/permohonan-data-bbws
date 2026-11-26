/* ==========================================================================
   pages/verification.js — Form verifikasi, persetujuan, penolakan, perbaikan
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  let selectedId = null;

  function pending(state) {
    return state.requests.filter(function (r) {
      return ["Diajukan", "Menunggu Verifikasi", "Perlu Perbaikan"].indexOf(r.status) !== -1 || r.id === selectedId;
    }).sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }

  function current(param) {
    const state = App.Store.get();
    const list = pending(state);
    if (param) selectedId = decodeURIComponent(param);
    if (!selectedId || !state.requests.some(function (r) { return r.id === selectedId; })) {
      selectedId = list.length ? list[0].id : (state.requests[0] ? state.requests[0].id : null);
    }
    return { state, request: state.requests.find(function (r) { return r.id === selectedId; }) || null, list };
  }

  function checkItem(key, label, desc, checked) {
    return '<label class="check-item"><input type="checkbox" data-check="' + App.h(key) + '" ' + (checked ? "checked" : "") + ">" +
      "<span><strong>" + App.h(label) + "</strong><span>" + App.h(desc) + "</span></span></label>";
  }

  App.Pages.verification = {
    title: "Verifikasi Permohonan",
    subtitle: "Periksa dan tentukan hasil verifikasi",

    render(param) {
      const { state, request, list } = current(param);

      if (!request) {
        return '<div class="card">' + App.empty("Tidak ada permohonan", "Belum ada permohonan yang perlu diverifikasi.", "checkSquare") + "</div>";
      }

      const cat = state.categories.find(function (c) { return c.id === request.categoryId; });
      const checks = request.verification.checks || {};
      const checkedCount = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
      const totalChecks = request.documents.length + 1;
      const complete = checkedCount === totalChecks;

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Form Verifikasi</h2>' +
        '<p>Pilih permohonan, periksa kelengkapan, lalu tentukan hasilnya</p></div>' +
        '<div class="page-toolbar__actions">' +
          '<a class="btn btn--outline" href="#/admin/detail/' + encodeURIComponent(request.id) + '">' + App.icon("eye") + "Lihat detail lengkap</a>" +
        "</div></div>" +

        '<div class="split-view">' +
          '<div class="card"><div class="card__head"><div><h3>Antrean Verifikasi</h3><p>' + list.length + " permohonan menunggu</p></div></div>" +
            '<ul class="request-picker">' + list.map(function (r) {
              return '<li><button type="button" data-pick="' + App.h(r.id) + '" class="' + (r.id === request.id ? "selected" : "") + '">' +
                "<strong>" + App.h(r.id) + " · " + App.h(r.applicant) + "</strong>" +
                "<span>" + App.h(r.subject) + "</span><span>" + App.fmtDate(r.submittedAt) + " · " + App.h(cat ? cat.name : "") + "</span>" +
                App.statusBadge(r.status) + "</button></li>";
            }).join("") + "</ul></div>" +

          '<div style="display:flex;flex-direction:column;gap:18px">' +
            '<div class="card"><div class="card__head"><div><h3>' + App.h(request.id) + " — " + App.h(request.applicant) + "</h3>" +
              "<p>" + App.h(request.subject) + "</p></div>" + App.statusBadge(request.status) + "</div>" +
              '<div class="card__body"><div class="info-grid">' +
                '<div class="info-item"><label>Email</label><div>' + App.h(request.email) + "</div></div>" +
                '<div class="info-item"><label>Instansi</label><div>' + App.h(request.institution || "-") + "</div></div>" +
                '<div class="info-item"><label>Kategori</label><div>' + App.h(cat ? cat.name : "—") + "</div></div>" +
                '<div class="info-item"><label>Tanggal Pengajuan</label><div>' + App.fmtDateTime(request.submittedAt) + "</div></div>" +
              "</div></div></div>" +

            '<div class="card"><div class="card__head"><div><h3>Pemeriksaan Kelengkapan</h3>' +
              "<p>" + checkedCount + " dari " + totalChecks + " item dicentang</p></div>" +
              (complete ? App.badge("Lengkap", "green") : App.badge("Belum lengkap", "amber")) + "</div>" +
              '<div class="card__body"><div class="checklist">' +
                checkItem("data", "Data pemohon sudah sesuai", "Nama, NIK, dan kontak terbaca dengan jelas", !!checks.data) +
                request.documents.map(function (d) {
                  return checkItem(d.name, d.name, App.fmtBytes(d.size) + " · " + App.fmtDate(d.uploadedAt), !!checks[d.name]);
                }).join("") +
              "</div></div></div>" +

            '<div class="card"><div class="card__head"><h3>Catatan Hasil Pemeriksaan</h3></div>' +
              '<div class="card__body"><div class="field"><label>Catatan untuk pemohon / tim internal</label>' +
                '<textarea class="textarea" id="verify-note" placeholder="Tuliskan hasil pemeriksaan, temuan, atau instruksi perbaikan…">' + App.h(request.verification.note || "") + "</textarea></div>" +
                '<div class="form-error" id="verify-error"></div>' +
                (request.verification.checkedAt ? '<div class="note-box note-box--green" style="margin-bottom:14px">Terakhir diperiksa oleh ' +
                  App.h(request.verification.checkedBy || "Admin") + " · " + App.fmtDateTime(request.verification.checkedAt) + "</div>" : "") +
                '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
                  '<button class="btn btn--outline" type="button" id="save-check">' + App.icon("save") + "Simpan Pemeriksaan</button>" +
                  '<button class="btn btn--success" type="button" id="approve-request">' + App.icon("checkCircle") + "Setujui</button>" +
                  '<button class="btn btn--danger" type="button" id="reject-request">' + App.icon("x") + "Tolak</button>" +
                  '<button class="btn btn--warning" type="button" id="repair-request">' + App.icon("refresh") + "Minta Perbaikan</button>" +
                "</div>" +
              "</div></div>" +
          "</div>" +
        "</div>";
    },

    mount(root, param) {
      const { request } = current(param);
      if (!request) return;
      const id = request.id;

      function rerender() {
        App.Layout.setContent(App.Pages.verification.render(id));
        App.Pages.verification.mount(document.getElementById("page-content"), id);
      }

      root.querySelectorAll("[data-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          selectedId = b.dataset.pick;
          location.hash = "#/admin/verification/" + encodeURIComponent(selectedId);
        });
      });

      root.querySelectorAll("[data-check]").forEach(function (box) {
        box.addEventListener("change", function () {
          App.Store.update(function (s) {
            const r = s.requests.find(function (x) { return x.id === id; });
            if (!r) return;
            r.verification.checks = r.verification.checks || {};
            r.verification.checks[box.dataset.check] = box.checked;
          });
          rerender();
        });
      });

      function readNote() {
        return root.querySelector("#verify-note").value.trim();
      }
      function setError(msg) {
        root.querySelector("#verify-error").textContent = msg;
      }
      function snapshot() {
        const r = App.Store.get().requests.find(function (x) { return x.id === id; });
        const checks = r.verification.checks || {};
        const required = r.documents.length + 1;
        const checkedCount = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
        return { r, checks, complete: checkedCount === required, note: readNote() };
      }

      root.querySelector("#save-check").addEventListener("click", function () {
        App.Store.update(function (s) {
          const r = s.requests.find(function (x) { return x.id === id; });
          r.verification.note = readNote();
          r.verification.checked = true;
          r.verification.checkedBy = App.Auth.displayName();
          r.verification.checkedAt = new Date().toISOString();
          r.updatedAt = new Date().toISOString();
          r.history.push({ at: new Date().toISOString(), text: "Hasil pemeriksaan disimpan", status: r.status, actor: App.Auth.displayName() });
          App.Store.log(s, "Verifikasi", "Menyimpan hasil pemeriksaan " + id);
        });
        App.toast("Berhasil", "Hasil pemeriksaan tersimpan.", "success");
        App.Layout.refresh();
        rerender();
      });

      root.querySelector("#approve-request").addEventListener("click", function () {
        const snap = snapshot();
        if (!snap.complete) return setError("Centang seluruh item kelengkapan sebelum menyetujui.");
        setError("");
        App.confirm("Setujui permohonan", "Permohonan " + id + " akan disetujui dan statusnya berubah menjadi Disetujui. Lanjutkan?", function () {
          App.Store.update(function (s) {
            const r = s.requests.find(function (x) { return x.id === id; });
            r.status = "Disetujui";
            r.notes = snap.note;
            r.repairReason = "";
            r.verification.complete = true;
            r.verification.note = snap.note;
            r.verification.checkedBy = App.Auth.displayName();
            r.verification.checkedAt = new Date().toISOString();
            r.updatedAt = new Date().toISOString();
            r.history.push({ at: new Date().toISOString(), text: "Permohonan disetujui oleh " + App.Auth.displayName(), status: "Disetujui", actor: App.Auth.displayName() });
            App.Store.notify(s, r.userId, "Permohonan disetujui", "Permohonan " + id + " telah disetujui dan sedang diproses.", "success", id);
            App.Store.log(s, "Verifikasi", "Menyetujui permohonan " + id);
          });
          App.toast("Berhasil", "Permohonan " + id + " disetujui.", "success");
          App.Layout.refresh();
          rerender();
        }, { confirmText: "Ya, setujui", subtitle: "Pastikan seluruh dokumen telah diperiksa." });
      });

      root.querySelector("#reject-request").addEventListener("click", function () {
        const snap = snapshot();
        if (!snap.note) return setError("Catatan penolakan wajib diisi sebelum menolak permohonan.");
        setError("");
        App.confirm("Tolak permohonan", "Permohonan " + id + " akan ditolak. Pemohon akan melihat catatan Anda. Lanjutkan?", function () {
          App.Store.update(function (s) {
            const r = s.requests.find(function (x) { return x.id === id; });
            r.status = "Ditolak";
            r.notes = snap.note;
            r.verification.complete = false;
            r.verification.note = snap.note;
            r.verification.checkedBy = App.Auth.displayName();
            r.verification.checkedAt = new Date().toISOString();
            r.updatedAt = new Date().toISOString();
            r.history.push({ at: new Date().toISOString(), text: "Permohonan ditolak: " + snap.note, status: "Ditolak", actor: App.Auth.displayName() });
            App.Store.notify(s, r.userId, "Permohonan ditolak", "Permohonan " + id + " tidak dapat dipenuhi: " + snap.note, "error", id);
            App.Store.log(s, "Penolakan", "Menolak permohonan " + id);
          });
          App.toast("Berhasil", "Permohonan " + id + " ditolak.", "success");
          App.Layout.refresh();
          rerender();
        }, { confirmText: "Ya, tolak" });
      });

      root.querySelector("#repair-request").addEventListener("click", function () {
        const snap = snapshot();
        if (!snap.note) return setError("Berikan catatan perbaikan sebelum mengirim permohonan kembali ke pemohon.");
        setError("");
        App.confirm("Minta perbaikan", "Permohonan " + id + " akan berstatus Perlu Perbaikan sampai pemohon mengunggah ulang dokumen. Lanjutkan?", function () {
          App.Store.update(function (s) {
            const r = s.requests.find(function (x) { return x.id === id; });
            r.status = "Perlu Perbaikan";
            r.repairReason = snap.note;
            r.notes = snap.note;
            r.verification.complete = false;
            r.verification.note = snap.note;
            r.verification.checkedBy = App.Auth.displayName();
            r.verification.checkedAt = new Date().toISOString();
            r.updatedAt = new Date().toISOString();
            r.history.push({ at: new Date().toISOString(), text: "Diminta perbaikan: " + snap.note, status: "Perlu Perbaikan", actor: App.Auth.displayName() });
            App.Store.notify(s, r.userId, "Perlu perbaikan dokumen", "Petugas meminta perbaikan pada permohonan " + id + ": " + snap.note, "warning", id);
            App.Store.log(s, "Perbaikan", "Meminta perbaikan permohonan " + id);
          });
          App.toast("Berhasil", "Permintaan perbaikan dikirim.", "success");
          App.Layout.refresh();
          rerender();
        }, { confirmText: "Ya, minta perbaikan" });
      });
    }
  };
})();
