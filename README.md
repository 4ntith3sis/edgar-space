# Edgar Space — Phase 4: WhatsApp Ordering Flow

Edgar Space adalah platform katalog dan toko online aksesori serta dekorasi rumah modern Indonesia.

Pada **Phase 4**, alur pemesanan produk via WhatsApp telah diimplementasikan secara elegan langsung dari halaman detail produk (`/produk/[slug]`). Fitur ini meliputi pemilih jumlah pesanan interaktif (`ProductQuantity.jsx`), validasi ketersediaan stok real-time, pembentukan pesan WhatsApp berbahasa Indonesia terstruktur dan ter-encode aman (`libs/whatsapp.js`), modal pratinjau konfirmasi pemesanan, serta sticky action bar untuk kenyamanan belanja di perangkat mobile.

---

## 🛠️ Teknologi & Arsitektur

- **Frontend**: Next.js (App Router, JavaScript/JSX)
- **Styling**: Tailwind CSS (Warm Minimalist Palette)
- **Backend API**: Express.js (RESTful API, port 5050)
- **Database**: PostgreSQL dengan Prisma ORM
- **Ordering Channel**: WhatsApp Web / WhatsApp Mobile (`https://wa.me/`)
- **Tanpa Database Pesanan Otomatis**: Tidak ada pemotongan stok otomatis dan tidak ada checkout/gateway pembayaran (pengelolaan stok & transaksi sepenuhnya manual oleh admin).

---

## 📦 Alur Bisnis Pemesanan (WhatsApp Ordering Flow)

```
Pengunjung
  ↓
Buka Halaman Detail Produk (/produk/[slug])
  ↓
Pilih Jumlah Pesanan (1 s/d batas stok)
  ↓
Klik "Pesan via WhatsApp"
  ↓
Validasi Stok Terbaru dari API
  ↓
Modal Konfirmasi & Pratinjau Pesan Muncul
  ↓
Klik "Lanjut ke WhatsApp"
  ↓
WhatsApp Terbuka dengan Pesan Otomatis
  ↓
Pelanggan Mengirim Pesan ke Admin Edgar Space
  ↓
Admin Konfirmasi & Kurangi Stok Manual di Dashboard
```

---

## 💬 Format Pesan WhatsApp

```text
Halo Edgar Space, saya tertarik untuk memesan produk berikut:

Produk: Cermin LED Touchscreen
Jumlah: 2
Harga: Rp 450.000
Subtotal: Rp 900.000

Link Produk:
http://localhost:3000/produk/cermin-led-touchscreen

Apakah produk tersebut masih tersedia?

Terima kasih.
```

---

## ⚙️ Variabel Lingkungan (.env)



## 🚀 Perintah Menjalankan & Verifikasi

```bash
# Menjalankan backend dan frontend:
npm run dev:all

# Verifikasi kode:
npm run lint
npm run build
```
