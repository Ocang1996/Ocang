# Panduan Deployment ASN Dashboard

Dokumen ini berisi panduan lengkap untuk men-deploy aplikasi ASN Dashboard pada jaringan lokal kantor.

## Prasyarat

1. Server dengan spesifikasi minimal:
   - Prosesor: Intel Core i5 atau setara
   - RAM: 8GB
   - Penyimpanan: 100GB (SSD direkomendasikan)
   - Sistem Operasi: Windows 10/11, Ubuntu 20.04 LTS, atau lebih baru

2. Software prasyarat:
   - Node.js 18 atau lebih baru
   - MongoDB 5.0 atau lebih baru
   - Git (opsional)

3. Koneksi jaringan lokal kantor
   - Alamat IP statis untuk server
   - Akses admin untuk router/switch (untuk pengaturan jaringan)

## Instalasi

### 1. Persiapan Sistem

#### Windows:

1. Unduh dan install Node.js dari [nodejs.org](https://nodejs.org)
2. Unduh dan install MongoDB Community Edition dari [mongodb.com](https://www.mongodb.com/try/download/community)
3. Buat direktori data untuk MongoDB:
   ```
   md C:\data\db
   ```
4. Konfigurasikan MongoDB sebagai service:
   ```
   md C:\data\log
   echo logpath=C:\data\log\mongod.log > C:\mongodb.conf
   echo dbpath=C:\data\db >> C:\mongodb.conf
   
   "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --config "C:\mongodb.conf" --install
   net start MongoDB
   ```

#### Linux (Ubuntu/Debian):

1. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Install MongoDB:
   ```bash
   sudo apt-get install gnupg
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

### 2. Persiapan Aplikasi

1. Pindahkan atau clone repository aplikasi:
   ```bash
   git clone <repository-url> asn-dashboard
   cd asn-dashboard
   ```
   
   Atau extract file zip jika repository diunduh secara manual.

2. Konfigurasi Backend (.env file):
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit file `.env` sesuai dengan konfigurasi yang diinginkan:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/asn-dashboard
   JWT_SECRET=ganti_dengan_string_random_yang_aman
   NODE_ENV=production
   ```

3. Install dependensi dan build backend:
   ```bash
   npm install
   npm run build
   ```

4. Konfigurasi Frontend:
   ```bash
   cd ..
   ```
   
   Buat file `.env` pada direktori root dengan isi:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```
   
   Jika ingin diakses dari jaringan lokal, gunakan alamat IP server:
   ```
   VITE_API_BASE_URL=http://192.168.x.x:5000
   ```

5. Install dependensi dan build frontend:
   ```bash
   npm install
   npm run build
   ```

### 3. Inisialisasi Data

1. Import data dasar:
   ```bash
   cd server
   npm run import-data
   ```
   
   Ini akan membuat beberapa data sample seperti user admin, unit kerja, dan data pegawai.

### 4. Menjalankan Aplikasi

#### Metode 1: Menjalankan dengan PM2 (Direkomendasikan untuk produksi)

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Buat file konfigurasi PM2 `ecosystem.config.js` di root direktori:
   ```js
   module.exports = {
     apps: [
       {
         name: 'asn-dashboard-api',
         script: 'server/dist/index.js',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
         env: {
           NODE_ENV: 'production'
         }
       },
       {
         name: 'asn-dashboard-frontend',
         script: 'serve',
         args: ['-s', 'dist', '-l', '3000'],
         instances: 1,
         autorestart: true,
         watch: false,
         env: {
           NODE_ENV: 'production'
         }
       }
     ]
   };
   ```

3. Install serve:
   ```bash
   npm install -g serve
   ```

4. Jalankan dengan PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

5. Untuk memastikan aplikasi berjalan setelah reboot:
   ```bash
   pm2 startup
   pm2 save
   ```

#### Metode 2: Menjalankan manual (untuk pengembangan)

1. Jalankan backend:
   ```bash
   cd server
   npm start
   ```

2. Jalankan frontend (pada terminal terpisah):
   ```bash
   cd ..
   npx serve -s dist
   ```

## Konfigurasi Akses Jaringan Lokal

### 1. Setting IP Statis

Berikan server alamat IP statis pada jaringan lokal:

#### Windows:
1. Buka Network and Sharing Center
2. Klik pada koneksi jaringan Anda
3. Klik Properties
4. Pilih Internet Protocol Version 4 (TCP/IPv4)
5. Klik Properties
6. Pilih "Use the following IP address"
7. Masukkan detail IP:
   - IP Address: 192.168.x.x (sesuai skema jaringan)
   - Subnet Mask: 255.255.255.0
   - Default Gateway: 192.168.x.1 (alamat router)
   - DNS Server: sesuai dengan DNS server jaringan

#### Linux:
1. Edit file konfigurasi netplan:
   ```bash
   sudo nano /etc/netplan/01-netcfg.yaml
   ```
2. Tambahkan konfigurasi:
   ```yaml
   network:
     version: 2
     ethernets:
       enp0s3:
         dhcp4: no
         addresses: [192.168.x.x/24]
         gateway4: 192.168.x.1
         nameservers:
           addresses: [8.8.8.8, 8.8.4.4]
   ```
3. Terapkan konfigurasi:
   ```bash
   sudo netplan apply
   ```

### 2. Membuka Firewall

#### Windows:
1. Buka Windows Defender Firewall
2. Klik "Advanced settings"
3. Pilih "Inbound Rules"
4. Klik "New Rule" dan pilih "Port"
5. Pilih "TCP" dan masukkan port "5000, 3000"
6. Pilih "Allow the connection"
7. Pilih domain, private, dan public networks
8. Berikan nama rule seperti "ASN Dashboard"

#### Linux:
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 3000/tcp
```

### 3. Akses dari Client

Setelah server berjalan, pengguna dapat mengakses aplikasi dengan browser:

1. Frontend: `http://192.168.x.x:3000`
2. API: `http://192.168.x.x:5000`

## Pemeliharaan

### Backup Database

Buat script backup otomatis dan simpan di /scripts/backup.sh:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backup"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR
mongodump --db asn-dashboard --out $BACKUP_DIR/$DATE
# Hapus backup lebih dari 30 hari
find $BACKUP_DIR/* -type d -mtime +30 -exec rm -rf {} \;
```

Jadwalkan dengan cron:
```
0 1 * * * /path/to/scripts/backup.sh
```

### Restore Database

Jika perlu restore database:
```bash
mongorestore --db asn-dashboard /path/to/backup/YYYYMMDD/asn-dashboard
```

### Update Aplikasi

1. Pull perubahan terbaru:
   ```bash
   git pull origin main
   ```

2. Update backend:
   ```bash
   cd server
   npm install
   npm run build
   ```

3. Update frontend:
   ```bash
   cd ..
   npm install
   npm run build
   ```

4. Restart aplikasi:
   ```bash
   # Jika menggunakan PM2
   pm2 restart all
   
   # Jika menjalankan manual, hentikan dan mulai ulang proses
   ```

## Troubleshooting

### MongoDB tidak berjalan
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
sudo systemctl status mongod
```

### API Error
1. Cek log:
   ```bash
   # Jika menggunakan PM2
   pm2 logs asn-dashboard-api
   
   # Jika menggunakan metode manual
   cd server
   npm start
   ```

2. Pastikan MongoDB berjalan:
   ```bash
   mongo --eval "db.stats()"
   ```

### Frontend tidak dapat terhubung ke API
1. Pastikan alamat API benar di file .env
2. Cek CORS settings di server/src/index.ts
3. Periksa firewall untuk memastikan port terbuka

## Support dan Kontak

Untuk bantuan lebih lanjut, hubungi tim IT di:
- Email: it-support@kantor.go.id
- Telepon: xxxx-xxxx 