# ASN Dashboard - Sistem Manajemen Pegawai

Aplikasi dashboard pengelolaan data Aparatur Sipil Negara (ASN) untuk penggunaan internal kantor.

## Fitur Utama

- Visualisasi data pegawai (PNS, P3K, dan non-ASN)
- Distribusi jenis kelamin dan usia pegawai
- Tingkat pendidikan pegawai
- Distribusi pangkat/golongan
- Distribusi jabatan
- Distribusi unit kerja
- Prediksi pensiun berdasarkan aturan BUP

## Kebutuhan Sistem

- Node.js (versi 18 atau lebih tinggi)
- MongoDB (versi 5.0 atau lebih tinggi)
- Web browser modern (Chrome, Firefox, Edge)
- Jaringan lokal kantor

## Panduan Instalasi

### 1. Persiapan Server

1. Install MongoDB Community Edition:
   - Unduh dari [situs resmi MongoDB](https://www.mongodb.com/try/download/community)
   - Ikuti petunjuk instalasi untuk sistem operasi Anda
   - Buat direktori data: `mkdir -p /data/db` (Linux/Mac) atau `md \data\db` (Windows)
   - Jalankan MongoDB server: `mongod`

2. Install Node.js:
   - Unduh dari [situs resmi Node.js](https://nodejs.org/)
   - Pilih versi LTS (Long Term Support)

### 2. Mengunduh dan Menyiapkan Aplikasi

1. Unduh atau clone repository ini ke komputer server
2. Buka terminal/command prompt di direktori aplikasi

### 3. Menyiapkan Backend

1. Masuk ke direktori server:
   ```
   cd server
   ```

2. Install dependensi:
   ```
   npm install
   ```

3. Buat file `.env` dengan konfigurasi berikut:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/asn-dashboard
   JWT_SECRET=rahasia_jwt_anda_ganti_ini
   NODE_ENV=production
   ```

4. Build aplikasi:
   ```
   npm run build
   ```

5. Jalankan server:
   ```
   npm start
   ```

### 4. Menyiapkan Frontend

1. Kembali ke direktori utama dan masuk ke direktori frontend:
   ```
   cd ..
   ```

2. Install dependensi:
   ```
   npm install
   ```

3. Build aplikasi frontend:
   ```
   npm run build
   ```

4. Siapkan server static (opsional, untuk produksi):
   ```
   npm install -g serve
   serve -s dist
   ```

## Akses Aplikasi

- Backend API: http://[alamat-server]:5000
- Frontend: http://[alamat-server]:3000 (development) atau http://[alamat-server]:5000 (production dengan serve)

## Pengaturan Jaringan Lokal

### 1. Konfigurasi IP Statis

Berikan IP statis pada server dengan konfigurasi jaringan lokal:
- IP Address: 192.168.1.x (sesuaikan dengan subnet jaringan kantor)
- Subnet Mask: 255.255.255.0
- Gateway: 192.168.1.1 (sesuaikan dengan router kantor)

### 2. Konfigurasi Firewall

Buka port yang diperlukan di firewall server:
- Port 5000: untuk API backend
- Port 3000 atau 80: untuk frontend

### 3. Akses untuk Pengguna

Pengguna di jaringan yang sama dapat mengakses aplikasi melalui browser dengan mengunjungi:
- http://[alamat-ip-server]:5000

## Inisialisasi Data

Untuk mengisi data awal, gunakan API endpoint yang tersedia:
1. Buat akun admin pertama:
   ```
   POST http://[alamat-server]:5000/api/auth/register
   ```

2. Login untuk mendapatkan token:
   ```
   POST http://[alamat-server]:5000/api/auth/login
   ```

3. Gunakan token untuk mengakses endpoint admin dan mengisi data pegawai dan unit kerja.

## Backup Data

Untuk backup database MongoDB:
```
mongodump --db asn-dashboard --out /path/ke/backup/directory
```

Untuk restore database:
```
mongorestore --db asn-dashboard /path/ke/backup/directory/asn-dashboard
```

## Pemeliharaan

- Lakukan backup database secara berkala
- Update aplikasi sesuai kebutuhan
- Pantau performa server dan database

## Kontak Dukungan

Untuk bantuan teknis, hubungi tim IT internal.

## Penanganan Foto & Gambar

Aplikasi dilengkapi dengan sistem penanganan dan optimasi gambar yang canggih:

### Fitur-fitur Penanganan Gambar:

- **Validasi Gambar**: Mendukung format JPEG, PNG, dan GIF dengan batasan ukuran file hingga 5MB.
- **Kompresi Otomatis**: Gambar dikompresi secara otomatis dengan tetap mempertahankan kualitas visual.
- **Resize Otomatis**: Gambar dengan dimensi besar akan di-resize secara proporsional untuk menghemat bandwidth dan penyimpanan.
- **Optimasi Kualitas**: Tingkat kompresi yang adaptif berdasarkan ukuran awal dan tipe file.

### Konfigurasi Penanganan Gambar:

Konfigurasi penanganan gambar dapat disesuaikan melalui file `src/lib/config.ts` dengan parameter berikut:

```typescript
export const IMAGE_CONFIG = {
  // Ukuran file maksimum (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Pengaturan kompresi
  COMPRESSION: {
    // Ukuran target setelah kompresi (2MB)
    TARGET_SIZE: 2 * 1024 * 1024,
    
    // Dimensi maksimum untuk resize
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    
    // Kualitas default untuk kompresi JPEG (0-1)
    DEFAULT_QUALITY: 0.9,
    
    // Kualitas untuk gambar berukuran besar (0-1)
    LARGE_IMAGE_QUALITY: 0.7
  },
  
  // Pengaturan thumbnail
  THUMBNAIL: {
    MAX_DIMENSION: 200,
    QUALITY: 0.7
  },
  
  // Jenis gambar yang diizinkan
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
};
```

Konfigurasi ini dapat dimodifikasi untuk menyesuaikan kebutuhan penyimpanan dan bandwidth aplikasi.

## Menjalankan Aplikasi

Untuk menjalankan aplikasi secara lokal, gunakan salah satu cara berikut:

### Cara 1: Menggunakan Script

#### Windows
Double-click file `launch.bat` untuk menjalankan aplikasi secara otomatis.

#### Linux/Mac
```bash
# Buat script executable terlebih dahulu
chmod +x launch.sh

# Jalankan script
./launch.sh
```

Script ini akan menjalankan development server dan membuka browser secara otomatis.

### Cara 2: Menggunakan Terminal

```bash
# Menjalankan aplikasi
npm run dev

# Menjalankan aplikasi dan otomatis membuka di browser
npm run dev -- --open
```

## Pengembangan

Setelah melakukan perubahan kode, Anda perlu me-restart server pengembangan:

1. Tekan `Ctrl+C` di terminal untuk menghentikan server yang sedang berjalan
2. Jalankan kembali script atau perintah terminal di atas

## Konfigurasi Bahasa

Aplikasi mendukung bahasa Indonesia dan Inggris. Untuk beralih bahasa, gunakan toggle pada header aplikasi. 