/* ==========================================================================
   utils.js — Icons, formatting, toast, modal, and small helpers
   ========================================================================== */
(function () {
  const p = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    files: '<path d="M8 3h9a2 2 0 0 1 2 2v13"/><path d="M5 7h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><path d="M7 13h5M7 17h5"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    checkSquare: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 12 3 3 5-6"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 9 5-5 5 5M12 4v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 13 5 5 5-5M12 18V6"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>',
    external: '<path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    fileImage: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.1 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.1 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.9 7l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21v4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
    award: '<circle cx="12" cy="8" r="5"/><path d="m8.5 13-2 8 5.5-3 5.5 3-2-8"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    helpCircle: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.5v.5"/><path d="M12 17h.01"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    sparkles: '<path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="m19 15 .8 1.8L21.5 18l-1.7.8L19 20.5l-.8-1.7-1.7-.8 1.7-.7z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    fileCheck: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    eyeOff: '<path d="m3 3 18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.2A10 10 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-2.2 3M6.3 6.3C3.6 8 1 12 1 12s4 7 11 7a10 10 0 0 0 3.7-.7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M17 7l2 2M15 9l2 2"/>',
    logoutCircle: '<circle cx="12" cy="12" r="9"/><path d="M9 12h7M13 9l3 3-3 3"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'
  };

  App.icons = p;

  App.icon = function (name, extraClass) {
    const body = p[name] || p.info;
    return '<svg class="' + (extraClass || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  };

  App.h = function (value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  App.fmtDate = function (value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  App.fmtDateTime = function (value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  App.fmtBytes = function (bytes) {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  App.timeAgo = function (value) {
    if (!value) return "—";
    const diff = Date.now() - new Date(value).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Baru saja";
    if (min < 60) return min + " menit lalu";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + " jam lalu";
    const day = Math.floor(hr / 24);
    if (day < 30) return day + " hari lalu";
    return App.fmtDate(value);
  };

  const STATUS = {
    "Diajukan": "blue",
    "Menunggu Verifikasi": "amber",
    "Perlu Perbaikan": "orange",
    "Disetujui": "green",
    "Dalam Proses": "purple",
    "Selesai": "slate",
    "Ditolak": "red",
    "Aktif": "green",
    "Nonaktif": "slate",
    "Admin": "blue",
    "Petugas": "purple",
    "Pemohon": "slate",
    "Tersedia": "green",
    "Sebagian Terbatas": "amber",
    "Terbatas": "red"
  };

  App.STATUS_LIST = ["Diajukan", "Menunggu Verifikasi", "Perlu Perbaikan", "Disetujui", "Dalam Proses", "Selesai", "Ditolak"];

  App.initials = function (name) {
    return String(name || "SIRADA").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
  };

  App.badge = function (label, tone) {
    const cls = tone || STATUS[label] || "slate";
    return '<span class="badge badge--' + cls + '">' + App.h(label) + "</span>";
  };

  App.statusBadge = function (status) { return App.badge(status); };

  App.category = function (id) {
    const state = App.Store.get();
    return state.categories.find(function (c) { return c.id === id; }) || null;
  };

  App.requestById = function (id) {
    return App.Store.get().requests.find(function (r) { return r.id === id; }) || null;
  };

  App.validEmail = function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "")); };

  App.readFile = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error("File tidak dapat dibaca.")); };
      reader.readAsDataURL(file);
    });
  };

  // Satu titik perubahan status: riwayat + notifikasi + aktivitas tercatat konsisten.
  App.changeStatus = function (requestId, status, text, actor) {
    let userId = null, title = "", type = "info";
    const messages = {
      "Menunggu Verifikasi": ["Permohonan sedang diverifikasi", "Permohonan Anda sedang diperiksa oleh petugas.", "info"],
      "Perlu Perbaikan": ["Perlu perbaikan dokumen", text || "Petugas meminta perbaikan dokumen permohonan Anda.", "warning"],
      "Disetujui": ["Permohonan disetujui", "Permohonan Anda telah disetujui dan akan segera diproses.", "success"],
      "Dalam Proses": ["Data sedang disiapkan", "Data yang Anda mohonkan sedang disiapkan petugas.", "info"],
      "Selesai": ["Data selesai disiapkan", "Data hasil permohonan telah tersedia untuk diunduh.", "success"],
      "Ditolak": ["Permohonan ditolak", text || "Permohonan Anda tidak dapat dipenuhi. Lihat catatan petugas.", "error"]
    };
    App.Store.update(function (s) {
      const r = s.requests.find(function (x) { return x.id === requestId; });
      if (!r) return;
      userId = r.userId;
      App.Store.pushHistory(s, r, status, text || "Status permohonan diperbarui menjadi " + status, actor || "Petugas");
      if (messages[status]) {
        title = messages[status][0];
        App.Store.notify(s, r.userId, title, messages[status][1], messages[status][2], r.id);
      }
      App.Store.log(s, "Status", text || ("Memperbarui status " + requestId + " menjadi " + status), actor);
    });
  };

  App.toast = function (title, message, type) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const t = type || "success";
    const icon = t === "error" ? "alertCircle" : t === "info" ? "info" : "checkCircle";
    const el = document.createElement("div");
    el.className = "toast toast--" + t;
    el.innerHTML =
      '<span class="toast__icon">' + App.icon(icon) + "</span>" +
      "<div><strong>" + App.h(title) + "</strong><span>" + App.h(message) + "</span></div>";
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateX(18px)";
      setTimeout(function () { el.remove(); }, 220);
    }, 3800);
  };

  App.modal = function (options) {
    const cfg = Object.assign({ title: "Konfirmasi", subtitle: "", body: "", confirmText: "Simpan", cancelText: "Batal", wide: false, hideFooter: false }, options || {});
    const root = document.getElementById("modal-root");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML =
      '<div class="modal ' + (cfg.wide ? "modal--wide" : "") + '" role="dialog" aria-modal="true">' +
        '<div class="modal__head"><div><h3>' + App.h(cfg.title) + "</h3>" +
        (cfg.subtitle ? "<p>" + App.h(cfg.subtitle) + "</p>" : "") + "</div>" +
        '<button class="modal__close" type="button" data-modal-close aria-label="Tutup">' + App.icon("x") + "</button></div>" +
        '<div class="modal__body">' + (cfg.body || "") + "</div>" +
        (cfg.hideFooter ? "" :
          '<div class="modal__foot">' +
            '<button class="btn btn--outline" type="button" data-modal-close>' + App.h(cfg.cancelText) + "</button>" +
            '<button class="btn btn--primary" type="button" data-modal-confirm>' + App.h(cfg.confirmText) + "</button>" +
          "</div>") +
      "</div>";

    root.innerHTML = "";
    root.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    function close() {
      backdrop.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop || e.target.closest("[data-modal-close]")) close();
    });
    document.addEventListener("keydown", onKey);

    const confirmBtn = backdrop.querySelector("[data-modal-confirm]");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async function () {
        if (!cfg.onConfirm) return close();
        confirmBtn.disabled = true;
        const original = confirmBtn.innerHTML;
        confirmBtn.textContent = "Memproses…";
        try {
          const result = await cfg.onConfirm(backdrop, close);
          if (result !== false) close();
        } catch (err) {
          console.error(err);
          App.toast("Gagal", err.message || "Terjadi kesalahan.", "error");
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = original;
        }
      });
    }

    return { close, element: backdrop };
  };

  App.confirm = function (title, message, onConfirm, opts) {
    const o = opts || {};
    return App.modal({
      title: title,
      subtitle: o.subtitle || "",
      body: '<p class="modal__message">' + App.h(message) + "</p>",
      confirmText: o.confirmText || "Ya, lanjutkan",
      cancelText: o.cancelText || "Batal",
      onConfirm: onConfirm
    });
  };

  App.paginate = function (items, page, perPage) {
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const current = Math.min(Math.max(1, page || 1), pages);
    return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pages, total };
  };

  App.debounce = function (fn, wait) {
    let t;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
    };
  };

  App.download = function (content, name, type) {
    const blob = content ? new Blob([content], { type: type || "application/octet-stream" }) : new Blob(["Dokumen hasil permohonan - " + name], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  App.empty = function (title, text, icon) {
    return '<div class="empty"><div class="empty__icon">' + App.icon(icon || "inbox") + "</div><strong>" +
      App.h(title) + "</strong><p>" + App.h(text) + "</p></div>";
  };

  App.monthKey = function (value) { return (value || "").slice(0, 7); };

  App.monthLabel = function (key, short) {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("id-ID", { month: short === false ? "long" : "short", year: "2-digit" });
  };
})();
