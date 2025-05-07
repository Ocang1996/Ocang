# Panduan Pengguna ASN Dashboard

Selamat datang di Panduan Pengguna ASN Dashboard. Dokumen ini berisi panduan lengkap untuk menggunakan aplikasi ASN Dashboard.

## Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Memulai](#memulai)
3. [Dashboard](#dashboard)
4. [Manajemen Pegawai](#manajemen-pegawai)
5. [Unit Kerja](#unit-kerja)
6. [Laporan](#laporan)
7. [Pengaturan](#pengaturan)

## Pengenalan

ASN Dashboard adalah aplikasi pengelolaan data Aparatur Sipil Negara (ASN) yang dirancang untuk memudahkan pemantauan dan pengelolaan data pegawai. Aplikasi ini menyediakan visualisasi data untuk berbagai kategori seperti distribusi pegawai berdasarkan jenis (PNS, P3K, non-ASN), gender, usia, pendidikan, pangkat/golongan, jabatan, dan unit kerja.

### Jenis Pengguna

Aplikasi ini memiliki tiga jenis pengguna:

1. **User Biasa**: Dapat melihat dashboard dan laporan
2. **Admin**: Dapat mengelola data pegawai dan unit kerja
3. **Super Admin**: Memiliki akses penuh ke semua fitur, termasuk manajemen pengguna

## Memulai

### Login

1. Buka aplikasi ASN Dashboard melalui browser Anda
2. Masukkan username dan password yang telah diberikan
3. Klik tombol "Login"

![Login Screen](login-screen.png)

### Lupa Password

Jika Anda lupa password:

1. Klik "Lupa Password" pada halaman login
2. Masukkan username atau email Anda
3. Anda akan menerima email untuk melakukan reset password
4. Ikuti instruksi dalam email tersebut

## Dashboard

### Tampilan Utama

Dashboard menampilkan ringkasan data pegawai dalam bentuk grafik dan statistik. Dashboard dibagi menjadi beberapa tab:

1. **Overview**: Menampilkan statistik umum
2. **Kepegawaian**: Detail distribusi pegawai
3. **Jabatan & Kompetensi**: Informasi tentang jabatan dan kompetensi
4. **Prediksi Pensiun**: Data prediksi pensiun berdasarkan BUP
5. **Beban Kerja**: Analisis beban kerja

### Grafik dan Visualisasi

Dashboard memiliki berbagai visualisasi data:

#### 1. Jenis Pegawai
Menampilkan distribusi pegawai berdasarkan jenis (PNS, P3K, non-ASN) dalam bentuk pie chart.

#### 2. Distribusi Gender
Menampilkan perbandingan jumlah pegawai laki-laki dan perempuan.

#### 3. Distribusi Usia
Menampilkan pembagian pegawai berdasarkan kelompok usia (< 30 tahun, 30-40 tahun, 41-50 tahun, > 50 tahun).

#### 4. Distribusi Unit Kerja
Menampilkan jumlah pegawai pada setiap unit kerja dalam bentuk bar chart.

#### 5. Tingkat Pendidikan
Menampilkan distribusi pegawai berdasarkan tingkat pendidikan terakhir (SD hingga S3).

#### 6. Distribusi Pangkat/Golongan
Menampilkan pembagian pegawai berdasarkan pangkat/golongan.

#### 7. Distribusi Jabatan
Menampilkan distribusi pegawai berdasarkan jenis jabatan (struktural, fungsional, pelaksana).

#### 8. Prediksi Pensiun
Menampilkan prediksi jumlah pegawai yang akan pensiun dalam 10 tahun mendatang berdasarkan aturan Batas Usia Pensiun (BUP).

## Manajemen Pegawai

Fitur ini memungkinkan Anda untuk mengelola data pegawai.

### Melihat Daftar Pegawai

1. Klik menu "Pegawai" di sidebar
2. Daftar pegawai akan ditampilkan dengan opsi pencarian dan filter

### Menambah Pegawai Baru

1. Klik tombol "Tambah Pegawai"
2. Isi formulir dengan data pegawai yang diperlukan:
   - NIP
   - Nama
   - Jenis Kelamin
   - Tanggal Lahir
   - Tanggal Bergabung
   - Jenis Pegawai
   - Unit Kerja
   - Jabatan
   - Pangkat/Golongan
   - Pendidikan
   - dll.
3. Klik "Simpan" untuk menyimpan data

### Mengedit Data Pegawai

1. Temukan pegawai yang ingin diedit di daftar
2. Klik ikon "Edit" (pensil)
3. Ubah data yang diperlukan
4. Klik "Simpan" untuk menyimpan perubahan

### Menghapus Pegawai

1. Temukan pegawai yang ingin dihapus di daftar
2. Klik ikon "Hapus" (tempat sampah)
3. Konfirmasi penghapusan

### Upload Foto Pegawai

1. Buka detail pegawai
2. Klik area foto atau tombol "Upload Foto"
3. Pilih file foto dari komputer Anda
4. Atur ukuran dan posisi foto jika perlu
5. Klik "Simpan"

### Import Data Pegawai

Untuk mengimpor data pegawai dalam jumlah banyak:

1. Klik tombol "Import Data"
2. Unduh template Excel yang disediakan
3. Isi template dengan data pegawai
4. Upload file Excel yang telah diisi
5. Verifikasi data dan konfirmasi import

## Unit Kerja

### Melihat Struktur Unit Kerja

1. Klik menu "Unit Kerja" di sidebar
2. Struktur unit kerja akan ditampilkan dalam bentuk hierarki

### Menambah Unit Kerja

1. Klik tombol "Tambah Unit Kerja"
2. Isi formulir dengan data yang diperlukan:
   - Nama Unit
   - Kode Unit
   - Deskripsi
   - Unit Induk (opsional)
3. Klik "Simpan"

### Mengedit Unit Kerja

1. Temukan unit kerja yang ingin diedit
2. Klik ikon "Edit"
3. Ubah data yang diperlukan
4. Klik "Simpan"

### Menghapus Unit Kerja

1. Temukan unit kerja yang ingin dihapus
2. Klik ikon "Hapus"
3. Konfirmasi penghapusan

**Catatan**: Unit kerja yang memiliki sub-unit atau pegawai yang terkait tidak dapat dihapus.

## Laporan

### Jenis Laporan

Aplikasi menyediakan beberapa jenis laporan:

1. **Laporan Pegawai**: Daftar lengkap pegawai
2. **Laporan Unit Kerja**: Distribusi pegawai per unit kerja
3. **Laporan Pendidikan**: Statistik tingkat pendidikan
4. **Laporan Pangkat/Golongan**: Statistik pangkat/golongan
5. **Laporan Pensiun**: Prediksi pensiun

### Membuat Laporan

1. Klik menu "Laporan" di sidebar
2. Pilih jenis laporan yang diinginkan
3. Atur filter dan parameter laporan
4. Klik "Buat Laporan"

### Export Laporan

Laporan dapat diekspor dalam beberapa format:

1. Klik tombol "Export" setelah laporan ditampilkan
2. Pilih format yang diinginkan (PDF, Excel, CSV)
3. Laporan akan diunduh ke komputer Anda

## Pengaturan

### Profil Pengguna

1. Klik nama pengguna di pojok kanan atas
2. Pilih "Profil"
3. Ubah data profil seperti nama, email, atau password
4. Klik "Simpan"

### Manajemen Pengguna (Khusus Super Admin)

1. Klik menu "Pengaturan" > "Pengguna"
2. Daftar pengguna akan ditampilkan

#### Menambah Pengguna

1. Klik tombol "Tambah Pengguna"
2. Isi formulir dengan data yang diperlukan:
   - Username
   - Nama
   - Email
   - Password
   - Role (User, Admin, Super Admin)
3. Klik "Simpan"

#### Mengedit Pengguna

1. Temukan pengguna yang ingin diedit
2. Klik ikon "Edit"
3. Ubah data yang diperlukan
4. Klik "Simpan"

#### Menghapus Pengguna

1. Temukan pengguna yang ingin dihapus
2. Klik ikon "Hapus"
3. Konfirmasi penghapusan

### Pengaturan Sistem

Pengaturan umum aplikasi (khusus Super Admin):

1. Klik menu "Pengaturan" > "Sistem"
2. Ubah pengaturan seperti nama instansi, logo, dll.
3. Klik "Simpan"

## Dukungan dan Bantuan

Jika Anda memiliki pertanyaan atau mengalami masalah, silakan hubungi administrator sistem atau tim IT melalui:

- Email: it-support@kantor.go.id
- Telepon: xxxx-xxxx

---

**Tim Pengembang ASN Dashboard**  
© 2023 Kantor XYZ. Hak Cipta Dilindungi. 