# SIRADA BBWS — Sistem Informasi Permohonan Data

Prototype antarmuka **SIRADA BBWS** (Sistem Informasi Permohonan Data Balai Besar Wilayah Sungai Bengawan Solo) berbasis **HTML, CSS, dan JavaScript murni** tanpa build step. Seluruh data contoh tersimpan di `localStorage`, sehingga alur pendaftaran, pengajuan, verifikasi, perbaikan, hingga unduhan data dapat dijalankan tanpa database.

## Menjalankan

Buka `index.html` di browser, atau jalankan server statis lokal:

```powershell
python -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Akun demo

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@bbwssolo.go.id` | `admin123` |
| Petugas | `petugas@bbwssolo.go.id` | `admin123` |
| Pemohon | `siti.rahmawati@example.com` | `pemohon123` |

Tombol isi otomatis tersedia pada halaman login. Password disimpan sebagai hash SHA-256 + salt di `localStorage` untuk simulasi; pada implementasi produksi gunakan bcrypt/Argon2 di server.

## Halaman publik (tanpa login)

- **Beranda** — hero, keunggulan, alur layanan, katalog ringkas, CTA.
- **Tentang SIRADA** — profil sistem dan instansi.
- **Katalog Data** — pencarian kategori data, detail kategori (klik kartu), pengalihan ke formulir pengajuan.
- **Panduan** — enam langkah pengajuan, dokumen persyaratan, tabel status.
- **FAQ** — pertanyaan umum dengan accordion.
- **Login / Daftar / Lupa password**.

## Portal pemohon (`#/saya/...`)

- **Dashboard** — ringkasan pengajuan, notifikasi, pengingat perbaikan.
- **Buat Permohonan** — formulir lengkap dengan unggah surat permohonan & dokumen pendukung (validasi tipe/ukuran, drag & drop, ringkasan, konfirmasi, nomor tiket otomatis).
- **Permohonan Saya** — tabel dengan pencarian, filter kategori/status, pagination.
- **Tracking Status** — kartu progres untuk setiap pengajuan.
- **Detail Permohonan** — timeline status, dokumen, catatan petugas, unggah perbaikan, unduh data hasil.
- **Notifikasi**, **Profil Saya**, **Pengaturan Akun** (ubah password & preferensi).

## Panel admin/petugas (`#/admin/...`)

Dashboard statistik & grafik, data permohonan (filter/ekspor/CRUD), verifikasi (centang kelengkapan → setujui/tolak/minta perbaikan), pemeriksaan ulang perbaikan, pengelolaan file hasil (upload/preview/unduh/hapus), kategori data, pengguna, riwayat aktivitas, notifikasi, dan pengaturan akun.

## Status permohonan

`Diajukan` → `Menunggu Verifikasi` → `Disetujui` → `Dalam Proses` → `Selesai`, dengan cabang `Perlu Perbaikan` dan `Ditolak`. Setiap perubahan status tercatat di timeline, notifikasi pemohon, dan riwayat aktivitas.

## Struktur file

```text
index.html                 Entry point + urutan script
styles.css                 Design system, komponen, halaman publik, responsif
js/
  data.js                  Seed data SIRADA + localStorage store
  utils.js                 Ikon, format, badge status, toast, modal, helper
  auth.js                  Login/register/logout + halaman publik
  layout.js                Shell dashboard (admin & pemohon)
  app.js                   Bootstrap + router dengan guard peran
  pages/                   Halaman admin/petugas
    dashboard.js  requests.js  detail.js  verification.js  repair.js
    uploads.js    categories.js  users.js  activity.js  notifications.js  settings.js
  pages/applicant/         Halaman portal pemohon
    dashboard.js  new-request.js  requests.js  tracking.js  detail.js
    notifications.js  profile.js  settings.js
```

## Fitur utama yang berfungsi

- Router hash dengan proteksi peran: tamu → publik, Pemohon → `#/saya/...`, Admin/Petugas → `#/admin/...`.
- Responsif di desktop, tablet, dan smartphone (sidebar & menu publik dapat dibuka/tutup).
- Nomor tiket unik (`SIRADA-YYYY-####`) untuk setiap permohonan baru.
- Unggah/unduh dokumen dengan validasi format dan ukuran; file kecil disimpan sebagai data URL agar dapat diunduh kembali.
- Perubahan status terlihat segera pada timeline pemohon dan memicu notifikasi + riwayat aktivitas.
- Catatan perbaikan dapat ditindaklanjuti pemohon, lalu diperiksa ulang petugas.
- Pencarian, filter, pagination, dan ekspor CSV pada tabel admin.

## Catatan

- Kembalikan data ke kondisi awal dengan `App.Store.reset()` di console browser.
- Sesi login disimpan di `sessionStorage` dengan kunci `sirada-session`; data aplikasi di `localStorage` dengan kunci `sirada-bbws-v2`.
- Ini adalah simulasi antarmuka. Tidak ada integrasi database/API, pembayaran, aplikasi native, atau e-signature sesuai ruang lingkup PRD fase 1.
