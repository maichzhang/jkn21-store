# 🛍️ JKN21 Store — Full Stack Marketplace

Marketplace lengkap dengan React.js + Node.js + PostgreSQL + Midtrans Payment

---

## 📁 Struktur Project

```
jkn21-store/
├── backend/          ← Node.js + Express API
│   ├── config/db.js  ← Konfigurasi PostgreSQL
│   ├── middleware/   ← Auth JWT + Upload foto
│   ├── routes/       ← API endpoints
│   ├── .env.example  ← Template environment variables
│   └── server.js     ← Entry point
└── frontend/         ← React.js
    ├── src/
    │   ├── pages/    ← Halaman-halaman
    │   ├── context/  ← Auth & Cart context
    │   ├── components/ ← Navbar, dll
    │   └── api.js    ← Axios config
    └── .env.example
```

---

## ⚙️ Requirements

- Node.js v18+
- PostgreSQL v14+
- Akun Midtrans (sandbox gratis di https://midtrans.com)

---

## 🚀 Cara Install & Jalankan

### 1. Setup Database PostgreSQL

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE jkn21_store;
\q
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env — isi DB_PASSWORD, MIDTRANS keys, JWT_SECRET

npm install
npm run dev
# API jalan di http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env — isi REACT_APP_MIDTRANS_CLIENT_KEY

npm install
npm start
# Web jalan di http://localhost:3000
```

---

## 🔑 Akun Default

Setelah backend pertama kali jalan, akun admin otomatis dibuat:

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@jkn21.com   | admin123 |

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/register    — Daftar akun baru
POST /api/auth/login       — Login
GET  /api/auth/profile     — Lihat profil (auth)
PUT  /api/auth/profile     — Update profil + foto (auth)
PUT  /api/auth/change-password — Ganti password (auth)
```

### Products
```
GET    /api/products              — List produk (query: category, search, sort, page)
GET    /api/products/:id          — Detail produk + review
POST   /api/products              — Tambah produk (seller/admin, multipart)
PUT    /api/products/:id          — Edit produk (seller/admin)
DELETE /api/products/:id          — Hapus produk (soft delete)
POST   /api/products/:id/reviews  — Tambah review (auth)
GET    /api/products/meta/categories — Daftar kategori
```

### Cart
```
GET    /api/cart        — Lihat keranjang (auth)
POST   /api/cart        — Tambah item (auth)
PUT    /api/cart/:id    — Update qty (auth)
DELETE /api/cart/:id    — Hapus item (auth)
DELETE /api/cart        — Kosongkan keranjang (auth)
```

### Orders
```
POST /api/orders              — Buat order + Midtrans payment (auth)
GET  /api/orders/my           — Pesanan saya (auth)
GET  /api/orders/admin/all    — Semua pesanan (admin)
PUT  /api/orders/:id/status   — Update status (admin)
POST /api/orders/webhook/midtrans — Webhook Midtrans
```

### Admin
```
GET /api/admin/stats           — Statistik dashboard (admin)
GET /api/admin/users           — Semua user (admin)
PUT /api/admin/users/:id/toggle — Toggle aktif/nonaktif (admin)
PUT /api/admin/users/:id/role  — Ganti role (admin)
```

---

## 💳 Setup Midtrans

1. Daftar di https://midtrans.com (gratis)
2. Masuk ke Dashboard → Settings → Access Keys
3. Copy **Server Key** dan **Client Key** (gunakan Sandbox untuk testing)
4. Isi di `.env` backend dan `.env` frontend
5. Untuk webhook: Settings → Configuration → Payment Notification URL
   → isi: `https://yourdomain.com/api/orders/webhook/midtrans`

---

## 🏦 Deploy ke VPS / Railway / Render

### Deploy Backend ke Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
# Set environment variables di Railway dashboard
```

### Deploy Frontend ke Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
# Set REACT_APP_API_URL ke URL backend Railway
```

### Deploy ke VPS (Ubuntu)
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clone project, setup .env, lalu:
cd backend && npm install && npm start

# Setup PM2 agar jalan terus
npm install -g pm2
pm2 start server.js --name jkn21-api
pm2 save
pm2 startup
```

---

## 👥 Role & Akses

| Fitur              | Guest | User | Seller | Admin |
|--------------------|-------|------|--------|-------|
| Lihat produk       | ✅   | ✅  | ✅    | ✅   |
| Beli produk        | ❌   | ✅  | ✅    | ✅   |
| Jual produk        | ❌   | ❌  | ✅    | ✅   |
| Upload foto produk | ❌   | ❌  | ✅    | ✅   |
| Kelola semua user  | ❌   | ❌  | ❌    | ✅   |
| Dashboard admin    | ❌   | ❌  | ❌    | ✅   |

---

## 📞 Support

Dibuat dengan ❤️ untuk JKN21 Store
