# Aksara & Lensa — Personal Branding + CMS + AI Photo-to-Story

Aplikasi website personal branding editorial modern dengan sistem CMS terintegrasi, Media Library aman, dan AI Content Assistant bertenaga **Google Gemini API (`gemini-3.8-flash`)** untuk mengubah dokumentasi foto nyata dan konteks faktual menjadi draf tulisan, esai reflektif, artikel, serta metadata SEO dalam Bahasa Indonesia yang autentik.

---

## 1. Fitur Utama

### A. Website Publik Personal Branding
- **Beranda (`/`)**: Hero section dengan pengantar personal, artikel unggulan, tulisan terbaru, cuplikan dokumentasi foto, dan portofolio pilihan.
- **Tentang Saya (`/tentang`)**: Biografi mendalam, nilai-nilai & prinsip hidup, bidang minat, riwayat pengalaman profesional nyata.
- **Daftar Tulisan (`/tulisan`)**: Katalog artikel dengan pencarian instan judul/konten, filter kategori, tag, dan pagination.
- **Detail Artikel (`/tulisan/[slug]`)**: Tipografi editorial nyaman dibaca, gambar utama dan pendukung, waktu baca, artikel terkait, dan tombol berbagi.
- **Portofolio (`/portofolio`, `/portofolio/[slug]`)**: Koleksi proyek dan kegiatan lengkap dengan peran, periode, dokumentasi, dan hasil pembelajaran nyata.
- **Galeri Visual (`/galeri`)**: Grid foto responsif dengan filter album dan viewer lightbox metadata autentik.
- **Kontak (`/kontak`)**: Informasi kontak terverifikasi dan formulir kontak dengan validasi server, proteksi spam honeypot, dan notifikasi inbox admin.
- **SEO & Feed**: `/sitemap.xml` dinamis dan `/robots.txt` standar mesin pencari.

### B. CMS Administrator (`/admin`)
- **Autentikasi Aman**: Sesi berbasis token terenkripsi, proteksi server-side, pembatasan percobaan login (rate limiter).
- **Dashboard Statistik Aktual**: Counter real-time (Total artikel, published, draft, archived, total foto, total portofolio, pesan masuk) dan live audit log.
- **Manajemen Artikel**: CRUD penuh, filter status (`draft`, `in_review`, `scheduled`, `published`, `archived`), slug otomatis/kustom, riwayat revisi artikel dengan fitur rollback.
- **Editor Markdown**: Penyunting teks kaya dengan pratinjau split-view seketika, pemilih foto utama dari media library, dan kolom SEO meta.
- **Media Library**: Upload banyak foto sekaligus, drag-and-drop, validasi tipe MIME di server, penandaan metadata (alt text, caption, lokasi, tanggal, publik/privat), serta proteksi penghapusan jika foto masih digunakan.
- **AI Studio (Photo-to-Story)**: Fitur utama bertenaga Gemini (`gemini-3.8-flash`) yang menerima foto dan konteks faktual untuk menghasilkan draf terstruktur, dilengkapi 10 tombol revisi AI dan alur penyimpanan draf manual (hasil AI tidak pernah diterbitkan secara otomatis).
- **Kategori & Tag**: Taksonomi konten dengan proteksi hapus jika berelasi dengan artikel aktif.
- **Pengaturan & Cadangan**: Kustomisasi hero beranda, data profil, unduh cadangan penuh JSON, ekspor seluruh artikel ke file Markdown, dan pemulihan data dari cadangan.

---

## 2. Struktur Proyek

```
├── data/                       # Penyimpanan persisten lokal server (db.json)
├── server/                     # Backend Node/Express
│   ├── auth.ts                 # Otentikasi & hashing PBKDF2
│   ├── db.ts                   # Mesin basis data persisten dengan atomic write
│   ├── gemini.ts               # Integrasi server-side Gemini API (gemini-3.8-flash)
│   ├── routes.ts               # REST API endpoints (Admin & Publik)
│   └── types.ts                # Kontrak skema TypeScript
├── src/                        # Frontend React + Tailwind CSS
│   ├── components/             # Komponen UI (Navbar, Footer, MarkdownRenderer, AdminLayout)
│   ├── lib/                    # Klien API terautentikasi dan Router SPA
│   ├── pages/
│   │   ├── admin/              # Halaman CMS (Dashboard, Artikel, Editor, AI Studio, Media, dll.)
│   │   └── public/             # Halaman publik (Beranda, Tentang, Tulisan, Portofolio, Galeri, Kontak)
│   ├── App.tsx                 # Routing utama
│   └── main.tsx                # Entry point React
├── supabase/
│   └── migrations/             # Skema PostgreSQL & Kebijakan Row Level Security (RLS)
├── uploads/                    # Direktori penyimpanan file media di server
├── server.ts                   # Entry point server full-stack Express + Vite
└── package.json
```

---

## 3. Panduan Konfigurasi & Menjalankan

### A. Prasyarat
- Node.js >= 18
- NPM

### B. Menjalankan di Lingkungan Pengembangan
1. Jalankan perintah instalasi dependensi (sudah terinstal pada workspace):
   ```bash
   npm install
   ```
2. Salin variabel lingkungan:
   ```bash
   cp .env.example .env
   ```
3. Mulai server pengembangan full-stack:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

### C. Konfigurasi Google Gemini API
1. Dapatkan API Key dari [Google AI Studio](https://aistudio.google.com/).
2. Masukkan ke file `.env`:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
3. Jika belum diisi, dashboard akan menampilkan status *"Kunci Belum Dikonfigurasi"*, namun seluruh fungsi penulisan manual, media library, dan website publik tetap bekerja normal 100%.

### D. Inisialisasi Akun Admin
- **URL Login Admin**: `/admin/login` atau klik ikon kunci di navbar/footer.
- **Kredensial Default**:
  - Username: `admin`
  - Kata Sandi: `admin123`
- Anda dapat mengubah kata sandi kapan saja di menu **Pengaturan Halaman > Keamanan Akun & Kata Sandi Admin**.

---

## 4. Skema Basis Data & Supabase Migrations

Aplikasi dirancang dengan arsitektur penyimpanan ganda yang fleksibel:
1. **Penyimpanan Persisten Server Aktif (`/data/db.json`)**: Berjalan otomatis tanpa konfigurasi database tambahan, mendukung atomic write, pengindeksan, riwayat revisi, audit log, dan relasi.
2. **PostgreSQL / Supabase Migration Ready**: Tersedia 2 file migrasi lengkap:
   - `supabase/migrations/20261023_001_initial_schema.sql`: 18 tabel dengan UUID v4, relasi foreign key, tipe enum, dan index pencarian.
   - `supabase/migrations/20261023_002_rls_policies.sql`: Kebijakan Row Level Security yang memisahkan akses pengunjung anonim (hanya konten published & foto publik) dari pemilik terautentikasi.

---

## 5. Ringkasan Endpoint API

### Publik
- `GET /api/public/settings` - Pengaturan global website
- `GET /api/public/profile` - Data profil personal pemilik
- `GET /api/public/posts` - Daftar artikel published (mendukung pencarian, kategori, tag, dan pagination)
- `GET /api/public/posts/:slug` - Detail artikel published beserta foto pendukung dan artikel terkait
- `GET /api/public/portfolios` - Daftar portofolio kegiatan
- `GET /api/public/portfolios/:slug` - Detail portofolio dan hasil pembelajaran nyata
- `GET /api/public/gallery` - Galeri foto publik
- `POST /api/public/contact` - Pengiriman formulir kontak dengan proteksi spam

### Admin (Memerlukan Header `Authorization: Bearer <token>`)
- `POST /api/auth/login` - Otentikasi admin
- `POST /api/auth/logout` - Keluar dari sesi
- `GET /api/admin/dashboard/stats` - Statistik aktual dan aktivitas terbaru
- `GET /api/admin/posts` - Daftar semua artikel (draft, published, scheduled, archived)
- `POST /api/admin/posts` - Buat artikel baru
- `PATCH /api/admin/posts/:id` - Perbarui artikel
- `POST /api/admin/posts/:id/publish` - Publikasi eksplisit artikel
- `POST /api/admin/posts/:id/archive` - Diarsipkan
- `POST /api/admin/media/upload` - Upload banyak foto dengan validasi MIME
- `POST /api/admin/ai/generate` - Analisis foto & generasi draf via Gemini API
- `POST /api/admin/ai/revise` - 10 alat revisi narasi AI
- `POST /api/admin/ai/save-draft` - Simpan hasil AI sebagai draf (tidak pernah auto-publish)
- `GET /api/admin/backup/export` - Unduh cadangan JSON penuh
- `POST /api/admin/backup/restore` - Pulihkan data dari cadangan JSON

---

## 6. Laporan Pengujian & Acceptance Criteria

| Kriteria Penerimaan | Status | Keterangan |
| :--- | :--- | :--- |
| Website publik mengambil data nyata dari basis data | **LULUS** | Beranda, Tentang, Tulisan, Portofolio, dan Galeri terhubung ke database. |
| Admin dapat login dan logout aman | **LULUS** | Token bearer diverifikasi server, sesi kedaluwarsa ditangani. |
| Admin dapat membuat, mengedit, menyimpan, dan mengarsipkan artikel | **LULUS** | Alur CRUD artikel lengkap dengan riwayat revisi dan rollback. |
| Data tetap persisten setelah server restart atau login ulang | **LULUS** | Menggunakan atomic write pada `./data/db.json`. |
| Upload banyak foto berfungsi dengan validasi server | **LULUS** | Multer memvalidasi MIME type dan ukuran maksimal 10MB. |
| AI menerima foto dan konteks melalui backend | **LULUS** | SDK `@google/genai` dieksekusi di server tanpa mengekspos API key. |
| AI menghasilkan JSON sesuai skema terstruktur | **LULUS** | Schema enforcement dengan judul alternatif, markdown, caption, dan tag. |
| Hasil AI tidak otomatis dipublikasikan | **LULUS** | Disimpan dengan status default `draft` untuk kurasi manual pemilik. |
| Artikel draf dan arsip tidak dapat diakses publik | **LULUS** | Endpoint publik hanya mengembalikan artikel dengan status `published`. |
| Proteksi penghapusan media yang sedang digunakan | **LULUS** | Sistem menolak hapus jika media berelasi dengan artikel atau portofolio. |
| Dynamic sitemap.xml dan robots.txt | **LULUS** | Hanya memuat URL halaman publik yang valid. |
