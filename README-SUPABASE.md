# Konfigurasi Supabase untuk ASN Dashboard

## Pendahuluan

ASN Dashboard menggunakan Supabase sebagai layanan backend untuk autentikasi, database, dan penyimpanan. Dokumen ini menjelaskan cara mengkonfigurasi Supabase untuk pengembangan lokal dan deployment.

## Konfigurasi Lokal

### Cara Otomatis (Direkomendasikan)

Gunakan script setup otomatis:

```bash
# Dengan npm
npm run setup:supabase

# Atau dengan yarn
yarn setup:supabase
```

Script ini akan menyalin file `.env.example` ke `.env` dan menampilkan informasi konfigurasi.

### Cara Manual

1. Salin file `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   
2. File `.env` sudah berisi kredensial Supabase yang benar:
   ```
   VITE_SUPABASE_URL=https://tmtdduuuvwafncifrved.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo
   VITE_API_BASE_URL=/api
   ```

3. Restart aplikasi untuk menerapkan perubahan.

### Cara dengan PowerShell

Jalankan script PowerShell untuk membuat file `.env`:
```
.\create-env.ps1
```

### Cara dengan Batch File (Windows)

Klik dua kali pada file `create-env.bat` atau jalankan dari Command Prompt:
```
create-env.bat
```

## Konfigurasi untuk Deployment

### Vercel, Netlify, Railway, Render, dll.

1. Tambahkan variabel lingkungan berikut di dashboard platform hosting:
   - `VITE_SUPABASE_URL`: `https://tmtdduuuvwafncifrved.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo`
   - `VITE_API_BASE_URL`: `/api`

2. Re-deploy aplikasi setelah menambahkan variabel lingkungan.

### Docker

Jika menggunakan Docker, pastikan untuk menyertakan variabel lingkungan dalam Dockerfile atau docker-compose.yml:

```yaml
environment:
  - VITE_SUPABASE_URL=https://tmtdduuuvwafncifrved.supabase.co
  - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo
  - VITE_API_BASE_URL=/api
```

## Pemecahan Masalah

### Error Supabase Setelah Login

Jika Anda mengalami masalah seperti:
- Error Supabase setelah login
- Error setelah refresh halaman
- Tidak dapat mengakses data

Kemungkinan besar masalahnya adalah konfigurasi Supabase yang tidak valid. Ikuti langkah-langkah di atas untuk memperbaikinya.

### Cek Koneksi ke Supabase

Untuk memverifikasi koneksi ke Supabase berjalan dengan baik:

1. Login ke aplikasi
2. Buka DevTools (F12 atau klik kanan -> Inspect)
3. Buka tab Console
4. Cek apakah ada error terkait Supabase

## Catatan Keamanan

- Kredensial Supabase yang digunakan adalah untuk **Anon Key** yang aman untuk digunakan di frontend
- Meskipun demikian, sebaiknya jangan menyebarkan kredensial ini secara publik
- Jika aplikasi ini digunakan untuk produksi dengan data sensitif, sebaiknya gunakan project Supabase terpisah dengan konfigurasi keamanan yang sesuai 