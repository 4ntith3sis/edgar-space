# 🏡 Edgar Space — Platform Katalog & Storefront Aksesori Rumah

**Edgar Space** adalah platform katalog dan toko online aksesori serta dekorasi rumah modern Indonesia. Proyek ini menggabungkan tampilan publik (Storefront) yang responsif dan elegan dengan Dashboard Admin interaktif untuk pengelolaan katalog produk, kategori, dan stok secara real-time, serta sistem pemesanan langsung via WhatsApp.

---

## 🛠️ Teknologi & Arsitektur

- **Frontend**: Next.js 14 (App Router, React 18, Tailwind CSS)
- **Backend API**: Express.js (RESTful API, Node.js)
- **Database & ORM**: PostgreSQL via Supabase dengan Prisma ORM
- **Autentikasi Admin**: JSON Web Token (JWT) & HTTP-only Cookies
- **Pemesanan**: Direct WhatsApp Integration (`https://wa.me/`) dengan validasi stok real-time
- **Iconography & Styling**: Lucide React Icons, Warm Minimalist Custom Palette

---

## ✨ Fitur Utama

### 🛒 Storefront Publik
- **Katalog & Navigasi**: Pencarian produk, filter kategori, pengurutan harga/nama/terbaru, dan paginasi.
- **Halaman Detail Produk**: Galeri gambar, pemilih kuantitas interaktif (`ProductQuantity`), status ketersediaan stok real-time, dan rekomendasi produk serupa.
- **Alur Pemesanan WhatsApp (Phase 4)**: 
  - Validasi ketersediaan stok terbaru dari API sebelum pesan dibuat.
  - Pembentukan pesan WhatsApp terstruktur & aman (`libs/whatsapp.js`).
  - Modal pratinjau konfirmasi pemesanan dan sticky action bar di mobile.
  - Dukungan fallback jika backend API tidak merespons.

### 🛡️ Dashboard Admin (`/admin`)
- **Autentikasi Sesi**: Login admin aman berbasis JWT token.
- **Manajemen Produk**: CRUD produk, pengaturan harga, deskripsi, gambar, status *featured*, dan manajemen stok inventory.
- **Manajemen Kategori**: CRUD kategori produk beserta slug dan deskripsi.
- **Upload Media**: Penanganan file gambar produk via Supabase / lokal uploads.

---

## 📁 Struktur Proyek

```text
edgar-space/
├── app/                  # Next.js 14 App Router (Pages, Layouts, API Route handlers)
│   ├── (shop)/           # Public Storefront routes (Beranda, Produk, Detail, Keranjang)
│   ├── admin/            # Dashboard Admin routes (Login, Products, Categories)
│   └── api/              # Proxy route handlers / Next API routes
├── server/               # Server Express RESTful API (Port 5050)
│   ├── controllers/      # Logic handler (products, categories, auth, checkout)
│   ├── middleware/       # JWT auth & error handling middleware
│   └── server.js         # Entry point server Express
├── components/           # Component React terisolasi
│   ├── common/           # Header, Footer, Navbar, Loading Skeletons
│   ├── home/             # Hero, CategorySection, FeaturedProducts
│   ├── products/         # ProductCard, ProductGrid, ProductFilter, ProductQuantity
│   └── admin/            # Layout Admin, Tables, Modals, Forms
├── context/              # React Context (AuthContext, CartContext)
├── libs/                 # Utility functions (api fetcher, formatters, whatsapp builder)
├── prisma/               # Schema Prisma, Migrasi, & Seed Script (`seed.js`)
├── public/               # Asset statis (gambar fallback, favicon, logo)
├── .env.example          # Template variabel lingkungan
└── README.md             # Dokumentasi proyek
```

---

## 📦 Alur Pemesanan WhatsApp (WhatsApp Ordering Flow)

```text
Pengunjung Storefront
  ↓
Buka Detail Produk (/produk/[slug]) atau Keranjang (/keranjang)
  ↓
Pilih Kuantitas Produk & Klik "Pesan via WhatsApp"
  ↓
API Validasi Stok Real-Time (/api/checkout/whatsapp)
  ↓
Modal Konfirmasi & Pratinjau Pesan WhatsApp Muncul
  ↓
Klik "Lanjut ke WhatsApp" (Membuka wa.me/...)
  ↓
Pesan Otomatis Terkirim ke WhatsApp Admin Edgar Space
  ↓
Admin Mengonfirmasi Transaksi & Memperbarui Stok di Dashboard Admin
```

### 💬 Format Pesan WhatsApp Otomatis

```text
Halo Edgar Space, saya tertarik untuk memesan produk berikut:

Produk: Cermin LED Touchscreen
Jumlah: 2
Harga: Rp 450.000
Subtotal: Rp 900.000

Link Produk:
https://edgar-space.vercel.app/produk/cermin-led-touchscreen

Apakah produk tersebut masih tersedia?

Terima kasih.
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env.local` di akar proyek dengan menyalin dari `.env.example`. Berikut deskripsi lengkap variabel lingkungan yang dibutuhkan:

| Nama Variabel | Akses Scope | Deskripsi & Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | Server | Connection string PostgreSQL Supabase (Direct port `5432` atau Transaction Pooler port `6543` dengan `?pgbouncer=true`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | URL project Supabase (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public/Anon API Key Supabase untuk akses client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Secret service-role key Supabase untuk operasi administratif server. *Jangan ekspos ke client!* |
| `NEXT_PUBLIC_API_URL` | Client & Server | URL base REST API Backend. Kosongkan di production Vercel untuk memakai same-origin `/api`, atau `http://localhost:5050` saat dev server terpisah. |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | URL utama domain aplikasi (`https://edgar-space.vercel.app`). |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Canonical App URL fallback. |
| `JWT_SECRET` | Server-only | String acak aman untuk signing token autentikasi JWT admin. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Client & Server | Nomor WhatsApp admin tujuan order (format internasional tanpa `+`, cth: `6281234567890`). |
| `PORT` | Server-only | Port server Express backend lokal (Default: `5050`). |
| `ADMIN_NAME` | Server-only | Nama admin default untuk seed database awal. |
| `ADMIN_EMAIL` | Server-only | Email admin default untuk seed database awal (`admin@edgarspace.com`). |
| `ADMIN_PASSWORD` | Server-only | Password admin default untuk seed database awal. |

---

## 🚀 Panduan Setup & Instalasi Lokal

### 1. Prasyarat
- Node.js versi 18.x atau lebih baru
- npm / yarn / pnpm
- Instance Database PostgreSQL (Supabase disarankan)

### 2. Langkah Instalasi

```bash
# 1. Clone repository & masuk ke direktori proyek
cd Edgar-space

# 3. Install seluruh dependensi
npm install

# 4. Salin file environment variables
cp .env.example .env.local
# (Sesuaikan nilai DATABASE_URL, JWT_SECRET, dll. di .env.local)

# 5. Generate Prisma Client & Jalankan Migrasi Database
npm run prisma:generate
npm run prisma:migrate

# 6. (Opsional) Seed Data Awal (Kategori, Produk Sampel, & Akun Admin Default)
npm run prisma:seed
```

### 3. Menjalankan Server Development

```bash
# Menjalankan Express API Server (Port 5050) & Next.js Storefront (Port 3000) secara bersamaan:
npm run dev:all

# Atau jalankan salah satu secara terpisah:
npm run dev:next  # Jalankan Next.js saja (Port 3000)
npm run server    # Jalankan Express API Backend saja (Port 5050)
```

Buka browser dan akses [http://localhost:3000](http://localhost:3000) untuk Storefront publik, dan [http://localhost:3000/admin/login](http://localhost:3000/admin/login) untuk Dashboard Admin.

---

## 📜 Skrip NPM yang Tersedia

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` / `npm run dev:all` | Menjalankan backend Express (port 5050) dan frontend Next.js (port 3000) secara bersamaan menggunakan `concurrently`. |
| `npm run dev:next` | Menjalankan server pengembangan Next.js saja. |
| `npm run server` | Menjalankan server Express backend saja (`server/server.js`). |
| `npm run build` | Melakukan `prisma generate` dan kompilasi production build Next.js. |
| `npm run start` | Menjalankan server produksi Next.js setelah proses build. |
| `npm run lint` | Melakukan pemeriksaan kualitas dan sintaks kode dengan ESLint. |
| `npm run prisma:generate` | Membuat ulang Prisma Client berdasarkan `prisma/schema.prisma`. |
| `npm run prisma:migrate` | Menjalankan migrasi skema database Prisma untuk alur development. |
| `npm run prisma:seed` | Mengisi database dengan data sampel awal (seed script `prisma/seed.js`). |

---

## 🌐 Deploy ke Production (Vercel + Supabase)

1. **Supabase**: Buat project baru di Supabase, jalankan migrasi Prisma ke database Supabase (`npx prisma db push` atau `npm run prisma:migrate`).
2. **Vercel**: Import repository ke Vercel Dashboard.
3. **Environment Variables**:
   - Masukkan seluruh variabel dari `.env.example` ke Vercel Project Settings → Environment Variables.
   - Jika menggunakan transaction pooler Supabase (port `6543`), pastikan menambahkan parameter `?pgbouncer=true` pada `DATABASE_URL`.
4. **Build Command**: Vercel secara otomatis mendeteksi Next.js dan akan menjalankan `npm run build` (`prisma generate && next build`).

