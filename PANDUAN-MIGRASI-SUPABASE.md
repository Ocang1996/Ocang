# Panduan Migrasi ASN Dashboard ke Supabase

Dokumen ini berisi petunjuk lengkap untuk memigrasikan aplikasi ASN Dashboard dari MongoDB ke Supabase dan menyiapkan aplikasi untuk penggunaan publik.

## Daftar Isi

1. [Persiapan Akun Supabase](#1-persiapan-akun-supabase)
2. [Menyiapkan Database Supabase](#2-menyiapkan-database-supabase)
3. [Konfigurasi Aplikasi Frontend](#3-konfigurasi-aplikasi-frontend)
4. [Migrasi Data dari MongoDB](#4-migrasi-data-dari-mongodb)
5. [Menjalankan Aplikasi di Lokal](#5-menjalankan-aplikasi-di-lokal)
6. [Deployment ke Produksi](#6-deployment-ke-produksi)
7. [Pemeliharaan dan Monitoring](#7-pemeliharaan-dan-monitoring)

## 1. Persiapan Akun Supabase

Supabase menawarkan paket gratis yang memadai untuk aplikasi skala kecil hingga menengah.

### Langkah-langkah:

1. **Buat Akun Supabase**:
   - Kunjungi [https://supabase.com/](https://supabase.com/) dan daftar akun gratis.

2. **Buat Project Baru**:
   - Masuk ke dashboard Supabase.
   - Klik tombol "New Project".
   - Isi nama project, misalnya "asn-dashboard".
   - Pilih password database (simpan dengan aman).
   - Pilih region terdekat (seperti Singapore).
   - Klik "Create new project".

3. **Catat Informasi Penting**:
   - Pada halaman "Project Settings" > "API", catat:
     - `Project URL` (SUPABASE_URL)
     - `anon public key` (SUPABASE_ANON_KEY)

## 2. Menyiapkan Database Supabase

### Membuat Skema Database

1. **Buka SQL Editor**:
   - Di dashboard Supabase, pilih tab "SQL Editor".
   - Klik "New Query".

2. **Import SQL Schema**:
   - Copy semua isi dari file `supabase-schema.sql` yang telah dibuat.
   - Paste ke dalam SQL Editor.
   - Klik "Run".

### Konfigurasi Authentication

1. **Setup Email Provider**:
   - Pergi ke "Authentication" > "Providers" > "Email".
   - Pastikan "Enable Email Sign In" diaktifkan.
   - Sesuaikan pengaturan lainnya jika diperlukan.

2. **Konfigurasi Reset Password**:
   - Pergi ke "Authentication" > "URL Configuration".
   - Atur "Site URL" ke domain aplikasi Anda (dalam mode pengembangan: `http://localhost:5173`).
   - Di bagian "Redirect URLs", tambahkan:
     - `http://localhost:5173/reset-password`
     - `https://yourdomain.com/reset-password` (untuk produksi)

3. **Membuat Bucket Storage**:
   - Pergi ke "Storage".
   - Klik "Create new bucket".
   - Beri nama "assets".
   - Pastikan "Public" dicentang.
   - Klik "Create".

## 3. Konfigurasi Aplikasi Frontend

### Mengatur Environment Variables

1. **Edit File .env**:
   - Buka file `.env` dan isi dengan nilai yang benar:
   ```
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_BASE_URL=/api
   ```

2. **Pastikan Supabase Client Terinstall**:
   ```bash
   npm install @supabase/supabase-js
   ```

### Update Config.ts

1. **Mengubah mode backend**:
   - Buka file `src/lib/config.ts`.
   - Ubah `USE_BACKEND` menjadi `true` untuk menggunakan API Supabase.

## 4. Migrasi Data dari MongoDB

### Ekspor Data dari MongoDB

Jika Anda memiliki data existing di MongoDB, Anda perlu mengekspornya:

```bash
mongoexport --db employee-management --collection users --out users.json
mongoexport --db employee-management --collection employees --out employees.json
mongoexport --db employee-management --collection work_units --out work_units.json
```

### Import Data ke Supabase

#### 1. Transformasi Data

Sebelum diimport, data perlu ditransformasi untuk menyesuaikan dengan skema Supabase. Berikut script sederhana Node.js untuk transformasi:

```javascript
// transform-data.js
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Transform users
const users = JSON.parse(fs.readFileSync('users.json'));
const transformedUsers = users.map(user => ({
  id: uuidv4(),
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role,
  created_at: user.createdAt || new Date().toISOString(),
  updated_at: user.updatedAt || new Date().toISOString()
}));
fs.writeFileSync('supabase-users.json', JSON.stringify(transformedUsers, null, 2));

// Transform employees (lakukan hal yang sama untuk employees dan work_units)
// ...
```

#### 2. Import Data ke Supabase

Gunakan fitur import di Supabase:
- Pergi ke "Table Editor".
- Pilih tabel yang akan diimport.
- Klik "Import Data" dan pilih file JSON.

## 5. Menjalankan Aplikasi di Lokal

### Frontend

1. **Jalankan aplikasi frontend**:
   ```bash
   npm run dev
   ```

### Pengujian

1. **Uji Fitur Autentikasi**:
   - Daftar user baru.
   - Login dengan user tersebut.
   - Uji fitur lupa password.

2. **Uji CRUD ASN**:
   - Tambah, lihat, edit, dan hapus data ASN.

3. **Uji Dashboard**:
   - Pastikan statistik ditampilkan dengan benar.

## 6. Deployment ke Produksi

### Build Frontend

1. **Build aplikasi untuk produksi**:
   ```bash
   npm run build
   ```

2. **Deploy ke hosting**:
   Beberapa opsi hosting:
   
   - **Vercel**:
     ```bash
     npm install -g vercel
     vercel
     ```
   
   - **Netlify**:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod
     ```

   - **GitHub Pages**:
     ```bash
     npm run build
     # Push hasil build ke branch gh-pages
     ```

### Pengaturan Domain

1. **Tambahkan Domain Custom**:
   - Tambahkan domain Anda di panel provider hosting.
   - Update DNS setting di registrar domain Anda.

2. **Update Supabase Configuration**:
   - Di Supabase dashboard, perbarui "Site URL" ke domain produksi Anda.
   - Tambahkan domain produksi ke "Redirect URLs".

## 7. Pemeliharaan dan Monitoring

### Monitoring

1. **Pantau Penggunaan Supabase**:
   - Dashboard Supabase memberikan statistik penggunaan.
   - Perhatikan batas paket gratis (500MB database, 1GB storage, dll).

2. **Backup Data**:
   - Lakukan backup secara berkala menggunakan fitur export di Supabase.

### Pemeliharaan

1. **Update Dependencies**:
   ```bash
   npm update
   ```

2. **Cek Keamanan**:
   ```bash
   npm audit
   ```

## Struktur Database Supabase

Berikut adalah struktur tabel yang telah dibuat di Supabase:

### 1. Users

| Kolom      | Tipe      | Deskripsi                     |
|------------|-----------|-------------------------------|
| id         | UUID      | ID user (dari auth.users)     |
| username   | TEXT      | Username (unik)               |
| email      | TEXT      | Email (unik)                  |
| name       | TEXT      | Nama lengkap                  |
| role       | TEXT      | Role (superadmin, admin, user)|
| created_at | TIMESTAMP | Waktu dibuat                  |
| updated_at | TIMESTAMP | Waktu diupdate                |

### 2. Employees

| Kolom        | Tipe      | Deskripsi                   |
|--------------|-----------|----------------------------- |
| id           | UUID      | ID pegawai                   |
| nip          | TEXT      | NIP (unik)                   |
| name         | TEXT      | Nama lengkap                 |
| position     | TEXT      | Jabatan                      |
| department   | TEXT      | Departemen                   |
| rank         | TEXT      | Pangkat/Golongan             |
| status       | TEXT      | Status (active, inactive)    |
| gender       | TEXT      | Jenis kelamin                |
| birth_date   | DATE      | Tanggal lahir                |
| education    | TEXT      | Pendidikan terakhir          |
| join_date    | DATE      | Tanggal bergabung            |
| work_unit_id | UUID      | ID unit kerja                |
| photo_url    | TEXT      | URL foto                     |
| created_at   | TIMESTAMP | Waktu dibuat                 |
| updated_at   | TIMESTAMP | Waktu diupdate               |

### 3. Work Units

| Kolom        | Tipe      | Deskripsi                   |
|--------------|-----------|----------------------------- |
| id           | UUID      | ID unit kerja                |
| name         | TEXT      | Nama unit kerja              |
| code         | TEXT      | Kode unit kerja (unik)       |
| parent_id    | UUID      | ID parent unit (nullable)    |
| level        | INTEGER   | Level dalam hierarki         |
| description  | TEXT      | Deskripsi unit kerja         |
| created_at   | TIMESTAMP | Waktu dibuat                 |
| updated_at   | TIMESTAMP | Waktu diupdate               |

---

Dengan mengikuti panduan ini, aplikasi ASN Dashboard Anda sekarang siap untuk digunakan dengan Supabase sebagai backend database. Framework ini memberikan kemudahan pengelolaan data, autentikasi, dan penyimpanan file, dengan antarmuka yang intuitif dan kemampuan skala yang memadai untuk kebutuhan publik.

Jika membutuhkan bantuan lebih lanjut, silakan merujuk ke dokumentasi resmi Supabase di [https://supabase.com/docs](https://supabase.com/docs).
