/* ==========================================================================
   pages/repair.js — Permohonan perlu perbaikan + pemeriksaan ulang
   ========================================================================== */
(function () {
  App.Pages = App.Pages || {};

  let selectedId = null;

  function list(state) {
    return state.requests.filter(function (r) { return r.status === "Perlu Perbaikan"; })
      .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
  }

  App.Pages.repair = {
    title: "Permohonan Perlu Perbaikan",
    subtitle: "Tindak lanjut permohonan yang belum memenuhi syarat",

    render() {
      const state = App.Store.get();
      const rows = list(state);
      if (!rows.some(function (r) { return r.id === selectedId; })) selectedId = rows.length ? rows[0].id : null;
      const selected = state.requests.find(function (r) { return r.id === selectedId; });

      return '<div class="page-toolbar"><div class="page-toolbar__text"><h2>Permohonan Perlu Perbaikan</h2>' +
        '<p>' + rows.length + " permohonan menunggu perbaikan dari pemohon</p></div>" +
        '<div class="page-toolbar__actions"><button class="btn btn--outline" type="button" id="refresh-repair">' + App.icon("refresh") + "Muat ulang</button></div></div>" +

        '<div class="card"><div class="card__body card__body--flush"><div class="table-wrap"><table class="table"><thead><tr>' +
          "<th>Kode</th><th>Pemohon</th><th>Kategori</th><th>Alasan Perbaikan</th><th>Status Perbaikan</th><th>Diperbarui</th><th>Aksi</th>" +
          "</tr></thead><tbody>" +
          (rows.length ? rows.map(function (r) {
            const cat = state.categories.find(function (c) { return c.id === r.categoryId; });
            return "<tr><td><span class=\"table__code\">" + App.h(r.id) + "</span></td>" +
              '<td class="table__primary">' + App.h(r.applicant) + "</td>" +
              "<td>" + App.h(cat ? cat.name : "—") + "</td>" +
              '<td style="max-width:280px">' + App.h(r.repairReason || r.notes || "—") + "</td>" +
              "<td>" + App.badge("Menunggu pemohon", "amber") + "</td>" +
              "<td>" + App.fmtDateTime(r.updatedAt) + "</td>" +
              '<td><div class="table__actions">' +
                '<button class="btn btn--blue btn--sm" type="button" data-recheck="' + App.h(r.id) + '">' + App.icon("refresh") + "Periksa Ulang</button>" +
                '<a class="icon-btn-table" href="#/admin/detail/' + encodeURIComponent(r.id) + '" title="Detail">' + App.icon("eye") + "</a>" +
              "</div></td></tr>";
          }).join("") : '<tr><td colspan="7">' + App.empty("Tidak ada permohonan", "Semua permohonan sudah memenuhi persyaratan.", "checkCircle") + "</td></tr>") +
          "</tbody></table></div></div></div>" +

        (selected ? '<div class="card" style="margin-top:18px"><div class="card__head"><div><h3>Catatan Admin · ' + App.h(selected.id) + "</h3>" +
          "<p>" + App.h(selected.applicant) + " · " + App.h(selected.subject) + "</p></div>" + App.statusBadge(selected.status) + "</div>" +
          '<div class="card__body"><div class="note-box">' +
            "<strong>Alasan permohonan perlu diperbaiki:</strong><p style='margin:6px 0 0'>" + App.h(selected.repairReason || "—") + "</p>" +
            "</div><div class='divider'></div><div class='info-grid'>" +
            "<div class='info-item'><label>Catatan untuk pemohon</label><div>" + App.h(selected.notes || "—") + "</div></div>" +
            "<div class='info-item'><label>Status perbaikan</label><div>" + (selected.verification.complete ? "Dokumen sudah diperbaiki" : "Menunggu unggahan ulang") + "</div></div>" +
            "</div></div></div>" : "");
    },

    mount(root) {
      function rerender() {
        App.Layout.setContent(App.Pages.repair.render());
        App.Pages.repair.mount(document.getElementById("page-content"));
      }

      root.querySelector("#refresh-repair").addEventListener("click", function () {
        rerender();
        App.toast("Diperbarui", "Data permohonan perlu perbaikan dimuat ulang.", "info");
      });

      root.querySelectorAll("[data-recheck]").forEach(function (b) {
        b.addEventListener("click", function () {
          const id = b.dataset.recheck;
          App.modal({
            title: "Periksa Ulang Perbaikan",
            subtitle: id,
            confirmText: "Simpan hasil",
            body: '<div class="field"><label>Hasil pemeriksaan ulang <span class="required">*</span></label>' +
              '<select class="select" id="recheck-result">' +
                '<option value="ok">Dokumen sudah sesuai — lanjut ke verifikasi</option>' +
                '<option value="bad">Masih belum memenuhi syarat</option>' +
              "</select></div>" +
              '<div class="field"><label>Catatan pemeriksaan <span class="required">*</span></label>' +
              '<textarea class="textarea" id="recheck-note" placeholder="Tuliskan hasil pemeriksaan ulang…"></textarea></div>' +
              '<div class="form-error" id="recheck-error"></div>',
            onConfirm(modal) {
              const result = modal.querySelector("#recheck-result").value;
              const note = modal.querySelector("#recheck-note").value.trim();
              if (!note) { modal.querySelector("#recheck-error").textContent = "Catatan pemeriksaan wajib diisi."; return false; }

              App.Store.update(function (s) {
                const r = s.requests.find(function (x) { return x.id === id; });
                r.notes = note;
                r.updatedAt = new Date().toISOString();
                if (result === "ok") {
                  r.status = "Menunggu Verifikasi";
                  r.repairReason = "";
                  r.verification.complete = false;
                  r.verification.note = note;
                  r.verification.checkedAt = new Date().toISOString();
                  r.verification.checkedBy = App.Auth.displayName();
                  r.history.push({ at: new Date().toISOString(), text: "Perbaikan diterima, permohonan lanjut verifikasi", status: "Menunggu Verifikasi", actor: App.Auth.displayName() });
                  App.Store.notify(s, r.userId, "Perbaikan diterima", "Dokumen perbaikan permohonan " + id + " diterima dan kembali diverifikasi.", "success", id);
                  App.Store.log(s, "Perbaikan", "Menerima perbaikan permohonan " + id);
                } else {
                  r.status = "Perlu Perbaikan";
                  r.repairReason = note;
                  r.verification.complete = false;
                  r.verification.note = note;
                  r.history.push({ at: new Date().toISOString(), text: "Perbaikan ditolak: " + note, status: "Perlu Perbaikan", actor: App.Auth.displayName() });
                  App.Store.notify(s, r.userId, "Perbaikan belum memenuhi", "Petugas menolak perbaikan permohonan " + id + ": " + note, "warning", id);
                  App.Store.log(s, "Perbaikan", "Menolak perbaikan permohonan " + id);
                }
              });
              App.toast("Berhasil", result === "ok" ? "Perbaikan diterima dan diteruskan ke verifikasi." : "Catatan penolakan perbaikan tersimpan.", "success");
              App.Layout.refresh();
              rerender();
            }
          });
        });
      });
    }
  };
})();
