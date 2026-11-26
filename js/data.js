/* ==========================================================================
   data.js — SIRADA BBWS: seed data + localStorage persistence layer
   Catatan: ini adalah simulasi frontend. Pada implementasi produksi, seluruh
   data dan hash password harus disimpan di server (MySQL + bcrypt/Argon2).
   ========================================================================== */
window.App = window.App || {};

(function () {
  const KEY = "sirada-bbws-v2";
  const LEGACY_KEY = "spp-admin-dashboard-v1";

  // SHA-256("sirada-bbws|pemohon123") dan SHA-256("sirada-bbws|admin123")
  const HASH_PEMOHON = "2e80f0df1a9e769c10ad07bdc3358e111da13712d1178a62712f4cdf398d0a25";
  const HASH_ADMIN = "cafbdf6eddc1efceff71f58f1fc8e2f78eec82acce017366ca77debc08dc6b08";

  const doc = (name, size, kind, at) => ({
    id: "DOC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    name, size, kind: kind || "Surat permohonan", type: "application/pdf", uploadedAt: at
  });

  function history(at, text, status, actor) {
    return { at, text, status: status || null, actor: actor || "Sistem" };
  }

  function request(cfg) {
    const submittedAt = cfg.submittedAt;
    const at = submittedAt;
    const h = [history(at, "Permohonan berhasil dikirim oleh pemohon", "Diajukan", cfg.applicant)];
    if (cfg.status === "Menunggu Verifikasi") h.push(history(at, "Permohonan masuk antrean verifikasi petugas", "Menunggu Verifikasi", "Sistem"));
    if (cfg.status === "Perlu Perbaikan") h.push(history(cfg.updatedAt || at, "Petugas meminta perbaikan dokumen: " + (cfg.repairReason || ""), "Perlu Perbaikan", "Petugas"));
    if (cfg.status === "Disetujui" || cfg.status === "Dalam Proses" || cfg.status === "Selesai") {
      h.push(history(at, "Dokumen diverifikasi dan permohonan disetujui", "Disetujui", "Petugas"));
    }
    if (cfg.status === "Dalam Proses" || cfg.status === "Selesai") {
      h.push(history(cfg.updatedAt || at, "Data sedang disiapkan oleh unit terkait", "Dalam Proses", "Petugas"));
    }
    if (cfg.status === "Selesai") h.push(history(cfg.updatedAt || at, "Data hasil tersedia untuk diunduh", "Selesai", "Petugas"));
    if (cfg.status === "Ditolak") h.push(history(cfg.updatedAt || at, "Permohonan ditolak: " + (cfg.notes || ""), "Ditolak", "Petugas"));

    return Object.assign({
      id: cfg.id,
      userId: cfg.userId,
      applicant: cfg.applicant,
      email: cfg.email,
      phone: cfg.phone || "0812-0000-0000",
      nik: cfg.nik || "3271xxxxxxxxxxxx",
      institution: cfg.institution || "-",
      applicantType: cfg.applicantType || "Masyarakat Umum",
      address: cfg.address || "Surakarta, Jawa Tengah",
      categoryId: cfg.categoryId,
      subject: cfg.subject,
      dataNeeded: cfg.dataNeeded || cfg.subject,
      purpose: cfg.purpose || "Keperluan riset dan penyusunan laporan",
      detail: cfg.detail || "",
      neededAt: cfg.neededAt || "",
      submittedAt,
      status: cfg.status,
      documents: cfg.documents || [],
      notes: cfg.notes || "",
      repairReason: cfg.repairReason || "",
      verification: {
        checked: cfg.status !== "Diajukan",
        complete: ["Disetujui", "Dalam Proses", "Selesai"].indexOf(cfg.status) !== -1,
        note: cfg.verificationNote || "",
        checkedBy: cfg.status === "Diajukan" ? "" : "Petugas Verifikasi",
        checkedAt: cfg.status === "Diajukan" ? "" : cfg.updatedAt || at,
        checks: {}
      },
      resultFileIds: cfg.resultFileIds || [],
      updatedAt: cfg.updatedAt || at,
      history: h
    });
  }

  const now = "2026-11-25T09:30:00";

  const seed = {
    version: 2,
    users: [
      { id: "USR-001", name: "Admin SIRADA", email: "admin@bbwssolo.go.id", passwordHash: HASH_ADMIN, role: "Admin", applicantType: "Instansi Pemerintah", institution: "BBWS Bengawan Solo", phone: "0271-000000", nik: "-", address: "Jl. Jenderal Ahmad Yani No. 45, Surakarta", registeredAt: "2025-01-15T08:00:00", status: "Aktif" },
      { id: "USR-002", name: "Petugas Verifikasi", email: "petugas@bbwssolo.go.id", passwordHash: HASH_ADMIN, role: "Petugas", applicantType: "Instansi Pemerintah", institution: "BBWS Bengawan Solo", phone: "0271-000001", nik: "-", address: "Jl. Jenderal Ahmad Yani No. 45, Surakarta", registeredAt: "2025-03-02T09:30:00", status: "Aktif" },
      { id: "USR-003", name: "Staf Layanan Data", email: "staf@bbwssolo.go.id", passwordHash: HASH_ADMIN, role: "Petugas", applicantType: "Instansi Pemerintah", institution: "BBWS Bengawan Solo", phone: "0271-000002", nik: "-", address: "Jl. Jenderal Ahmad Yani No. 45, Surakarta", registeredAt: "2025-06-07T13:20:00", status: "Aktif" },

      { id: "USR-010", name: "Siti Rahmawati", email: "siti.rahmawati@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Mahasiswa", institution: "Universitas Sebelas Maret", phone: "0812-3456-1001", nik: "3271056405980001", address: "Jl. Ir. Sutami No. 36, Surakarta", registeredAt: "2026-02-11T09:00:00", status: "Aktif" },
      { id: "USR-011", name: "Ahmad Fauzi", email: "ahmad.fauzi@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Peneliti", institution: "Lembaga Penelitian Lingkungan", phone: "0812-3456-1002", nik: "3271056405980002", address: "Jl. Veteran No. 12, Solo", registeredAt: "2026-03-24T11:40:00", status: "Aktif" },
      { id: "USR-012", name: "Dewi Anggraini", email: "dewi.anggraini@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Masyarakat Umum", institution: "-", phone: "0812-3456-1003", nik: "3271056405980003", address: "Jl. Slamet Riyadi No. 88, Solo", registeredAt: "2026-04-02T08:25:00", status: "Aktif" },
      { id: "USR-013", name: "Budi Santoso", email: "budi.santoso@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Instansi Pemerintah", institution: "Bappeda Kota Surakarta", phone: "0812-3456-1004", nik: "3271056405980004", address: "Jl. Kwitang No. 5, Solo", registeredAt: "2026-05-19T15:10:00", status: "Aktif" },
      { id: "USR-014", name: "Maya Sari", email: "maya.sari@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Lembaga Pendidikan", institution: "SMA Negeri 1 Surakarta", phone: "0812-3456-1005", nik: "3271056405980005", address: "Jl. Alun-Alun Utara, Solo", registeredAt: "2026-06-01T10:05:00", status: "Aktif" },
      { id: "USR-015", name: "Rizky Pratama", email: "rizky.pratama@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Mahasiswa", institution: "Universitas Gadjah Mada", phone: "0812-3456-1006", nik: "3271056405980006", address: "Jl. Sosio Yustisia, Yogyakarta", registeredAt: "2026-06-14T09:50:00", status: "Aktif" },
      { id: "USR-016", name: "Nurul Hidayah", email: "nurul.hidayah@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Organisasi", institution: "Yayasan Sungai Bersih", phone: "0812-3456-1007", nik: "3271056405980007", address: "Jl. Bayer No. 21, Solo", registeredAt: "2026-07-02T14:18:00", status: "Aktif" },
      { id: "USR-017", name: "Fajar Nugroho", email: "fajar.nugroho@example.com", passwordHash: HASH_PEMOHON, role: "Pemohon", applicantType: "Peneliti", institution: "Balai Penelitian Air", phone: "0812-3456-1008", nik: "3271056405980008", address: "Jl. Pengeringan No. 3, Solo", registeredAt: "2026-08-11T10:00:00", status: "Aktif" }
    ],

    categories: [
      { id: "cat-hidrologi", name: "Data Hidrologi", code: "HID", description: "Data debit sungai, tinggi muka air, curah hujan, dan kualitas air.", info: "Tersedia data harian & bulanan dari pos pengamat.", availability: "Tersedia", active: true, icon: "activity" },
      { id: "cat-tata-air", name: "Data Tata Air", code: "TAS", description: "Informasi pengelolaan sumber daya air, neraca air, dan pola operasi.", info: "Disusun oleh unit perencanaan BBWS.", availability: "Tersedia", active: true, icon: "layers" },
      { id: "cat-prasarana", name: "Data Prasarana & Sarana", code: "PRS", description: "Data bendungan, pintu air, tanggul, dan sarana pengukuran.", info: "Data kondisi dan lokasi prasarana.", availability: "Tersedia", active: true, icon: "building" },
      { id: "cat-banjir", name: "Data Banjir & Bencana", code: "BNJ", description: "Riwayat kejadian banjir, titik genangan, dan data kerugian.", info: "Rekap kejadian tahun berjalan dan tahun sebelumnya.", availability: "Tersedia", active: true, icon: "alert" },
      { id: "cat-irigasi", name: "Data Irigasi", code: "IRG", description: "Data daerah irigasi, luas garapan, dan sistem distribusi air.", info: "Koordinasi dengan unit pengelola irigasi.", availability: "Tersedia", active: true, icon: "database" },
      { id: "cat-kebijakan", name: "Regulasi & Kebijakan", code: "REG", description: "Peraturan, surat keputusan, dan pedoman teknis di bidang SDA.", info: "Dokumen publik dan dokumen terbatas.", availability: "Sebagian Terbatas", active: true, icon: "file" },
      { id: "cat-geospasial", name: "Peta & Geospasial", code: "GEO", description: "Peta topografi, DAS, dan data spasial wilayah kerja BBWS.", info: "Memerlukan persetujuan tambahan untuk data tertentu.", availability: "Terbatas", active: true, icon: "folder" }
    ],

    statusCatalog: [
      { name: "Diajukan", tone: "blue", description: "Permohonan berhasil dikirim" },
      { name: "Menunggu Verifikasi", tone: "amber", description: "Menunggu pemeriksaan petugas" },
      { name: "Perlu Perbaikan", tone: "orange", description: "Dokumen atau informasi perlu diperbaiki" },
      { name: "Disetujui", tone: "green", description: "Permohonan mendapatkan persetujuan" },
      { name: "Dalam Proses", tone: "purple", description: "Data sedang disiapkan" },
      { name: "Selesai", tone: "slate", description: "Data telah tersedia untuk pemohon" },
      { name: "Ditolak", tone: "red", description: "Permohonan tidak dapat dipenuhi" }
    ],

    requests: [
      request({ id: "SIRADA-2026-0001", userId: "USR-010", applicant: "Siti Rahmawati", email: "siti.rahmawati@example.com", categoryId: "cat-hidrologi", subject: "Data debit Sungai Bengawan Solo", dataNeeded: "Data debit harian 5 tahun terakhir pada pos Awogede", purpose: "Penulisan skripsi hidrologi", detail: "Diperlukan dalam bentuk tabel Excel bila memungkinkan.", neededAt: "2026-12-15", submittedAt: "2026-11-24T09:15:00", status: "Diajukan", documents: [doc("Surat_Permohonan_Siti.pdf", 248320, "Surat permohonan", "2026-11-24T09:15:00"), doc("KTM_Siti.pdf", 184320, "Dokumen pendukung", "2026-11-24T09:15:00")] }),
      request({ id: "SIRADA-2026-0002", userId: "USR-011", applicant: "Ahmad Fauzi", email: "ahmad.fauzi@example.com", institution: "Lembaga Penelitian Lingkungan", applicantType: "Peneliti", categoryId: "cat-banjir", subject: "Riwayat banjir wilayah Solo Raya", dataNeeded: "Data kejadian banjir 2019-2025 berikut titik genangan", purpose: "Penelitian mitigasi bencana", submittedAt: "2026-11-23T10:42:00", updatedAt: "2026-11-24T08:10:00", status: "Menunggu Verifikasi", documents: [doc("Surat_Permohonan_Ahmad.pdf", 312000, "Surat permohonan", "2026-11-23T10:42:00"), doc("Proposal_Penelitian.pdf", 524288, "Dokumen pendukung", "2026-11-23T10:42:00")] }),
      request({ id: "SIRADA-2026-0003", userId: "USR-012", applicant: "Dewi Anggraini", email: "dewi.anggraini@example.com", categoryId: "cat-irigasi", subject: "Data Daerah Irigasi Kiri Solo", dataNeeded: "Luas area dan jadwal pembagian air", purpose: "Kajianizal irigasi masyarakat", submittedAt: "2026-11-22T08:05:00", updatedAt: "2026-11-22T14:20:00", status: "Perlu Perbaikan", repairReason: "Surat permohonan belum bermeterai dan fotokopi identitas kurang jelas.", notes: "Mohon unggah ulang surat bermeterai Rp10.000 serta identitas yang lebih jelas.", verificationNote: "Dokumen tidak memenuhi syarat.", documents: [doc("Surat_Permohonan_Dewi.pdf", 210000, "Surat permohonan", "2026-11-22T08:05:00"), doc("KTP_Dewi.jpg", 190000, "Dokumen pendukung", "2026-11-22T08:05:00")] }),
      request({ id: "SIRADA-2026-0004", userId: "USR-013", applicant: "Budi Santoso", email: "budi.santoso@example.com", institution: "Bappeda Kota Surakarta", applicantType: "Instansi Pemerintah", categoryId: "cat-tata-air", subject: "Data neraca air wilayah Surakarta", dataNeeded: "Neraca air tahunan dan proyeksi kebutuhan", purpose: "Penyusunan RPJMD daerah", submittedAt: "2026-11-20T13:30:00", updatedAt: "2026-11-24T10:55:00", status: "Dalam Proses", resultFileIds: [], documents: [doc("Surat_Dinas_Bappeda.pdf", 428600, "Surat permohonan", "2026-11-20T13:30:00")] }),
      request({ id: "SIRADA-2026-0005", userId: "USR-014", applicant: "Maya Sari", email: "maya.sari@example.com", institution: "SMA Negeri 1 Surakarta", applicantType: "Lembaga Pendidikan", categoryId: "cat-hidrologi", subject: "Data kualitas air untuk praktikum", dataNeeded: "Hasil pengukuran kualitas air sungai", purpose: "Media pembelajaran siswa", submittedAt: "2026-11-19T11:12:00", updatedAt: "2026-11-19T15:00:00", status: "Ditolak", notes: "Data yang dimohonkan merupakan data mentah hasil laboratorium yang belum dipublikasikan.", verificationNote: "Data belum dapat dibagikan.", documents: [doc("Surat_Sekolah.pdf", 265200, "Surat permohonan", "2026-11-19T11:12:00")] }),
      request({ id: "SIRADA-2026-0006", userId: "USR-015", applicant: "Rizky Pratama", email: "rizky.pratama@example.com", categoryId: "cat-prasarana", subject: "Data pintu air di wilayah Sragen", dataNeeded: "Lokasi dan spesifikasi pintu air", purpose: "Penelitian infrastruktur air", submittedAt: "2026-11-18T09:50:00", updatedAt: "2026-11-24T15:42:00", status: "Selesai", resultFileIds: ["FILE-0001"], documents: [doc("Surat_Permohonan_Rizky.pdf", 312480, "Surat permohonan", "2026-11-18T09:50:00")] }),
      request({ id: "SIRADA-2026-0007", userId: "USR-016", applicant: "Nurul Hidayah", email: "nurul.hidayah@example.com", institution: "Yayasan Sungai Bersih", applicantType: "Organisasi", categoryId: "cat-banjir", subject: "Data titik genangan banjir", dataNeeded: "Peta titik genangan bulan Januari 2026", purpose: "Program edukasi masyarakat", submittedAt: "2026-11-17T14:18:00", status: "Diajukan", documents: [doc("Surat_Yayasan.pdf", 198400, "Surat permohonan", "2026-11-17T14:18:00")] }),
      request({ id: "SIRADA-2026-0008", userId: "USR-017", applicant: "Fajar Nugroho", email: "fajar.nugroho@example.com", categoryId: "cat-geospasial", subject: "Peta DAS Bengawan Solo", dataNeeded: "Peta batas DAS format SHP", purpose: "Pemetaan wilayah riset", submittedAt: "2026-06-12T10:00:00", updatedAt: "2026-06-15T09:00:00", status: "Disetujui", documents: [doc("Surat_Permohonan_Fajar.pdf", 245000, "Surat permohonan", "2026-06-12T10:00:00")] }),
      request({ id: "SIRADA-2026-0009", userId: "USR-010", applicant: "Siti Rahmawati", email: "siti.rahmawati@example.com", categoryId: "cat-hidrologi", subject: "Data curah hujan stasiun Karanganyar", dataNeeded: "Curah hujan harian bulan Maret-Mei 2026", purpose: "Laporan akhir magang", submittedAt: "2026-07-08T09:20:00", updatedAt: "2026-07-09T11:00:00", status: "Perlu Perbaikan", repairReason: "Periode data yang dimohonkan belum dicantumkan secara spesifik.", notes: "Mohon sebutkan rentang tanggal dan stasiun pengamat yang dibutuhkan.", verificationNote: "Informasi periode belum lengkap.", documents: [doc("Surat_Magang.pdf", 220000, "Surat permohonan", "2026-07-08T09:20:00")] }),
      request({ id: "SIRADA-2026-0010", userId: "USR-011", applicant: "Ahmad Fauzi", email: "ahmad.fauzi@example.com", categoryId: "cat-tata-air", subject: "Data operasi bendungan", dataNeeded: "Pola operasi bendungan wilayah Wonogiri", purpose: "Studi pengelolaan waduk", submittedAt: "2026-08-15T08:40:00", updatedAt: "2026-08-18T09:15:00", status: "Selesai", resultFileIds: ["FILE-0002"], documents: [doc("Surat_Penelitian.pdf", 301000, "Surat permohonan", "2026-08-15T08:40:00")] }),
      request({ id: "SIRADA-2026-0011", userId: "USR-012", applicant: "Dewi Anggraini", email: "dewi.anggraini@example.com", categoryId: "cat-kebijakan", subject: "Peraturan pengelolaan Sungai Bengawan Solo", dataNeeded: "Salinan Perda dan Surat Keputusan terkait", purpose: "Kajian regulasi sungai", submittedAt: "2026-09-03T15:25:00", updatedAt: "2026-09-10T09:10:00", status: "Selesai", resultFileIds: ["FILE-0003"], documents: [doc("Surat_Permohonan_Dewi2.pdf", 245000, "Surat permohonan", "2026-09-03T15:25:00")] }),
      request({ id: "SIRADA-2026-0012", userId: "USR-013", applicant: "Budi Santoso", email: "budi.santoso@example.com", institution: "Bappeda Kota Surakarta", categoryId: "cat-prasarana", subject: "Data tanggul wilayah Kota Solo", dataNeeded: "Panjang dan kondisi tanggul", purpose: "Perencanaan pengamanan kota", submittedAt: "2026-09-21T10:05:00", updatedAt: "2026-09-22T09:00:00", status: "Ditolak", notes: "Data detail teknis tanggul termasuk kategori terbatas.", verificationNote: "Data termasuk kategori terbatas.", documents: [doc("Surat_Dinas2.pdf", 280000, "Surat permohonan", "2026-09-21T10:05:00")] }),
      request({ id: "SIRADA-2026-0013", userId: "USR-014", applicant: "Maya Sari", email: "maya.sari@example.com", categoryId: "cat-irigasi", subject: "Data saluran irigasi sekolah", dataNeeded: "Peta saluran irigasi sekitar sekolah", purpose: "Proyek pembelajaran geografi", submittedAt: "2026-10-05T13:10:00", status: "Diajukan", documents: [doc("Surat_Sekolah2.pdf", 198000, "Surat permohonan", "2026-10-05T13:10:00")] }),
      request({ id: "SIRADA-2026-0014", userId: "USR-015", applicant: "Rizky Pratama", email: "rizky.pratama@example.com", categoryId: "cat-hidrologi", subject: "Data muka air sungai Bulan November", dataNeeded: "High water mark pos Kertosono", purpose: "Validasi model hidrologi", submittedAt: "2026-10-19T09:35:00", updatedAt: "2026-10-20T08:30:00", status: "Menunggu Verifikasi", documents: [doc("Surat_Rizky2.pdf", 210000, "Surat permohonan", "2026-10-19T09:35:00")] }),
      request({ id: "SIRADA-2026-0015", userId: "USR-016", applicant: "Nurul Hidayah", email: "nurul.hidayah@example.com", categoryId: "cat-banjir", subject: "Data kerugian banjir 2025", dataNeeded: "Rekapitulasi kerugian materi", purpose: "Laporan program yayasan", submittedAt: "2026-11-02T11:45:00", updatedAt: "2026-11-05T14:30:00", status: "Dalam Proses", documents: [doc("Surat_Yayasan2.pdf", 265000, "Surat permohonan", "2026-11-02T11:45:00")] }),
      request({ id: "SIRADA-2026-0016", userId: "USR-017", applicant: "Fajar Nugroho", email: "fajar.nugroho@example.com", categoryId: "cat-tata-air", subject: "Data kebutuhan air domestik", dataNeeded: "Proyeksi kebutuhan air 2026-2030", purpose: "Penelitian bidang tata air", submittedAt: "2026-11-10T16:05:00", updatedAt: "2026-11-11T10:15:00", status: "Perlu Perbaikan", repairReason: "Tujuan penggunaan data belum dijelaskan secara rinci.", notes: "Mohon tambahkan penjelasan metode analisis yang akan digunakan.", verificationNote: "Tujuan penggunaan kurang spesifik.", documents: [doc("Surat_Fajar2.pdf", 230000, "Surat permohonan", "2026-11-10T16:05:00")] })
    ],

    notifications: [
      { id: "NOT-001", userId: "USR-010", title: "Permohonan berhasil dikirim", message: "Permohonan SIRADA-2026-0001 berhasil dikirim dan mendapat nomor tiket.", type: "success", at: "2026-11-24T09:15:00", read: false, requestId: "SIRADA-2026-0001" },
      { id: "NOT-002", userId: "USR-012", title: "Perlu perbaikan dokumen", message: "Petugas meminta perbaikan pada permohonan SIRADA-2026-0003.", type: "warning", at: "2026-11-22T14:20:00", read: false, requestId: "SIRADA-2026-0003" },
      { id: "NOT-003", userId: "USR-015", title: "Data selesai disiapkan", message: "Data hasil untuk permohonan SIRADA-2026-0006 telah tersedia.", type: "success", at: "2026-11-24T15:42:00", read: false, requestId: "SIRADA-2026-0006" },
      { id: "NOT-004", userId: "USR-011", title: "Permohonan diverifikasi", message: "Permohonan SIRADA-2026-0002 sedang diperiksa petugas.", type: "info", at: "2026-11-24T08:10:00", read: true, requestId: "SIRADA-2026-0002" },
      { id: "NOT-005", userId: "USR-014", title: "Permohonan ditolak", message: "Permohonan SIRADA-2026-0005 tidak dapat dipenuhi. Lihat catatan petugas.", type: "error", at: "2026-11-19T15:00:00", read: true, requestId: "SIRADA-2026-0005" },
      { id: "NOT-006", userId: "USR-013", title: "Permohonan disetujui", message: "Permohonan SIRADA-2026-0004 telah disetujui dan sedang diproses.", type: "success", at: "2026-11-21T10:00:00", read: true, requestId: "SIRADA-2026-0004" },
      { id: "NOT-007", userId: "USR-017", title: "Perlu perbaikan dokumen", message: "Petugas meminta perbaikan pada permohonan SIRADA-2026-0016.", type: "warning", at: "2026-11-11T10:15:00", read: true, requestId: "SIRADA-2026-0016" }
    ],

    activities: [
      { id: "ACT-001", admin: "Petugas Verifikasi", type: "Verifikasi", detail: "Menyetujui permohonan SIRADA-2026-0006", at: "2026-11-24T15:42:00" },
      { id: "ACT-002", admin: "Staf Layanan Data", type: "Upload", detail: "Mengunggah hasil FILE-0001 untuk SIRADA-2026-0006", at: "2026-11-24T15:40:00" },
      { id: "ACT-003", admin: "Admin SIRADA", type: "Verifikasi", detail: "Memverifikasi dokumen SIRADA-2026-0002", at: "2026-11-24T08:10:00" },
      { id: "ACT-004", admin: "Petugas Verifikasi", type: "Perbaikan", detail: "Meminta perbaikan SIRADA-2026-0003", at: "2026-11-22T14:20:00" },
      { id: "ACT-005", admin: "Admin SIRADA", type: "Kategori", detail: "Memperbarui kategori Peta & Geospasial", at: "2026-11-22T10:00:00" },
      { id: "ACT-006", admin: "Staf Layanan Data", type: "Verifikasi", detail: "Memproses data SIRADA-2026-0004", at: "2026-11-21T10:00:00" },
      { id: "ACT-007", admin: "Petugas Verifikasi", type: "Penolakan", detail: "Menolak permohonan SIRADA-2026-0005", at: "2026-11-19T15:00:00" },
      { id: "ACT-008", admin: "Admin SIRADA", type: "Upload", detail: "Mengunggah hasil FILE-0002 untuk SIRADA-2026-0010", at: "2026-08-18T09:15:00" },
      { id: "ACT-009", admin: "Staf Layanan Data", type: "Upload", detail: "Mengunggah hasil FILE-0003 untuk SIRADA-2026-0011", at: "2026-09-10T09:10:00" },
      { id: "ACT-010", admin: "Admin SIRADA", type: "Pengguna", detail: "Mengaktifkan akun USR-017", at: "2026-08-11T10:05:00" }
    ],

    resultFiles: [
      { id: "FILE-0001", requestId: "SIRADA-2026-0006", name: "Data_Pintu_Air_Sragen.pdf", size: 428600, type: "application/pdf", access: "Pemohon", uploadedAt: "2026-11-24T15:40:00", uploadedBy: "Staf Layanan Data", content: null },
      { id: "FILE-0002", requestId: "SIRADA-2026-0010", name: "Pola_Operasi_Waduk.pdf", size: 312480, type: "application/pdf", access: "Pemohon", uploadedAt: "2026-08-18T09:15:00", uploadedBy: "Admin SIRADA", content: null },
      { id: "FILE-0003", requestId: "SIRADA-2026-0011", name: "Kumpulan_Regulasi_SDA.pdf", size: 389100, type: "application/pdf", access: "Pemohon", uploadedAt: "2026-09-10T09:10:00", uploadedBy: "Staf Layanan Data", content: null }
    ]
  };

  function cloneSeed() { return JSON.parse(JSON.stringify(seed)); }

  App.Store = {
    key: KEY,

    init() {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        localStorage.removeItem(LEGACY_KEY);
        localStorage.setItem(KEY, JSON.stringify(cloneSeed()));
      }
      return this.get();
    },

    get() {
      try { return JSON.parse(localStorage.getItem(KEY)) || cloneSeed(); }
      catch (e) { return cloneSeed(); }
    },

    set(state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { console.error("Gagal menyimpan state:", e); App.toast && App.toast("Penyimpanan penuh", "Sebagian file besar tidak dapat disimpan di browser.", "error"); }
      return state;
    },

    update(fn) {
      const state = this.get();
      const result = fn(state);
      this.set(state);
      return result === undefined ? state : result;
    },

    log(state, type, detail, actor) {
      const user = App.Auth && App.Auth.currentUser ? App.Auth.currentUser() : null;
      state.activities.unshift({
        id: "ACT-" + Date.now() + Math.floor(Math.random() * 90 + 10),
        admin: actor || (user ? user.name : "Sistem"),
        type, detail, at: new Date().toISOString()
      });
    },

    notify(state, userId, title, message, type, requestId) {
      state.notifications.unshift({
        id: "NOT-" + Date.now() + Math.floor(Math.random() * 90 + 10),
        userId, title, message, type: type || "info", at: new Date().toISOString(),
        read: false, requestId: requestId || null
      });
    },

    nextTicket(state) {
      const year = new Date().getFullYear();
      const prefix = "SIRADA-" + year + "-";
      const max = state.requests.reduce(function (acc, r) {
        if (r.id.indexOf(prefix) !== 0) return acc;
        const n = parseInt(r.id.slice(prefix.length), 10);
        return isNaN(n) ? acc : Math.max(acc, n);
      }, 0);
      return prefix + String(max + 1).padStart(4, "0");
    },

    pushHistory(state, request, status, text, actor) {
      const at = new Date().toISOString();
      request.updatedAt = at;
      if (status) request.status = status;
      request.history.push(history(at, text, status, actor || "Sistem"));
    },

    reset() {
      localStorage.setItem(KEY, JSON.stringify(cloneSeed()));
      return this.get();
    },

    uid(prefix) { return prefix + "-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10); }
  };

  App.seed = seed;
  App.SEED_HASH = { pemohon: HASH_PEMOHON, admin: HASH_ADMIN };
})();
