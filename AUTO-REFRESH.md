# Auto-Refresh Guide

Aplikasi ini dilengkapi dengan fitur auto-refresh otomatis yang akan me-refresh browser secara otomatis setiap kali ada perubahan pada kode.

## Cara Menggunakan

### Metode 1: Gunakan File Launch

Cara paling mudah adalah dengan menggunakan file launch yang tersedia:

- **Windows**: Klik dua kali pada file `launch.bat`
- **Linux/Mac**: Jalankan `./launch.sh` di terminal

### Metode 2: PowerShell Script

Jika Anda menggunakan PowerShell, jalankan:

```powershell
./run-app.ps1
```

Kemudian pilih opsi 4 untuk menjalankan client dengan auto-refresh tingkat lanjut.

### Metode 3: Command Line

Anda juga bisa menjalankan auto-refresh secara manual menggunakan perintah npm:

```bash
npm run dev:auto
```

## Fitur Auto-Refresh

Sistem auto-refresh pada aplikasi ini memiliki beberapa level:

### Basic Auto-Refresh (dev:watch)

- Menggunakan fitur Hot Module Replacement (HMR) default dari Vite
- Mendeteksi perubahan file dan me-refresh komponen tertentu
- Dijalankan dengan `npm run dev:watch`

### Advanced Auto-Refresh (dev:auto)

- Menggunakan plugin custom untuk auto-refresh lebih agresif
- Memantau perubahan file secara aktif dengan chokidar
- Memberikan refresh halaman penuh untuk perubahan style (CSS)
- Refresh komponen secara real-time untuk file JavaScript/TypeScript
- Dijalankan dengan `npm run dev:auto`

## Troubleshooting

Jika auto-refresh tidak berfungsi:

1. Pastikan file yang Anda edit berada dalam direktori yang dipantau (`src/components`, `src/lib`, dll.)
2. Coba refresh manual browser jika diperlukan
3. Restart server dengan menutup terminal dan menjalankan kembali

## Direktori yang Dipantau

Auto-refresh akan memantau perubahan pada direktori berikut:

- `src/components`
- `src/lib`
- `src/types`
- `public`
- `src/assets`

## Dependensi yang Digunakan

Fitur auto-refresh menggunakan paket-paket berikut:

- Vite (hot module replacement)
- chokidar (file watcher)
- concurrently (menjalankan beberapa command sekaligus)

Jika ada masalah, pastikan dependensi ini terinstal dengan benar. 