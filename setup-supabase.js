// Script sederhana untuk menyiapkan konfigurasi Supabase
const fs = require('fs');
const path = require('path');

console.log('🔧 Menyiapkan konfigurasi Supabase...');

// Cek apakah file .env sudah ada
if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  console.log('✅ File .env sudah ada. Jika Anda ingin menggunakan konfigurasi dari .env.example, hapus file .env terlebih dahulu.');
} else {
  // Salin .env.example ke .env
  try {
    fs.copyFileSync(
      path.join(process.cwd(), '.env.example'),
      path.join(process.cwd(), '.env')
    );
    console.log('✅ File .env berhasil dibuat dari .env.example');
    console.log('🔑 Kredensial Supabase sudah dikonfigurasi:');
    
    // Tampilkan isi file .env
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    console.log('\n' + envContent);
    
    console.log('\n✨ Konfigurasi Supabase selesai!');
    console.log('🚀 Anda sekarang dapat menjalankan aplikasi dengan perintah:');
    console.log('   npm run dev');
  } catch (error) {
    console.error('❌ Gagal menyalin file .env.example ke .env:', error.message);
    console.log('👉 Salin file .env.example ke .env secara manual dan ganti nilai-nilai yang diperlukan.');
  }
} 