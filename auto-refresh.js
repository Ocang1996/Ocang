#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chokidar from 'chokidar';

// Mendapatkan __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fungsi untuk mengirim pesan ke konsol
function log(message) {
  console.log(`[Auto-Refresh] ${message}`);
}

// Direktori yang akan dipantau
const watchDirs = [
  path.join(__dirname, 'src/components'),
  path.join(__dirname, 'src/lib'),
  path.join(__dirname, 'src/types'),
  path.join(__dirname, 'public'),
  path.join(__dirname, 'src/assets')
];

log('Memulai pemantauan file untuk auto-refresh...');

// Membuat watcher dengan chokidar
const watcher = chokidar.watch(watchDirs, {
  ignored: /(^|[\/\\])\../, // Abaikan file tersembunyi
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

// Set untuk menyimpan file yang telah diubah
const changedFiles = new Set();

// Saat ada file yang diubah
watcher
  .on('change', filePath => {
    const relativePath = path.relative(__dirname, filePath);
    
    // Abaikan perubahan pada node_modules
    if (relativePath.includes('node_modules')) return;
    
    // Tambahkan ke set file yang berubah
    changedFiles.add(relativePath);
    
    log(`File berubah: ${relativePath}`);
    
    // Jika file adalah komponen atau file style, catat untuk auto-refresh
    if (
      relativePath.endsWith('.tsx') || 
      relativePath.endsWith('.jsx') || 
      relativePath.endsWith('.css') || 
      relativePath.endsWith('.scss')
    ) {
      log(`Perubahan terdeteksi pada komponen: ${path.basename(relativePath)}`);
      
      // Untuk file CSS, kita bisa menulis file sentinel untuk memicu refresh
      if (relativePath.endsWith('.css') || relativePath.endsWith('.scss')) {
        const timestamp = new Date().toISOString();
        const sentinelPath = path.join(__dirname, 'src', '.refresh-trigger.css');
        fs.writeFileSync(sentinelPath, `/* Auto-refresh triggered at ${timestamp} */\n\n/* Untuk file: ${relativePath} */`);
        log('Memulai auto-refresh...');
      }
    }
  })
  .on('error', error => log(`Error: ${error}`));

log('Pemantauan file aktif. Menunggu perubahan...');

// Menunjukkan panduan penggunaan
log('Panduan:');
log('- Simpan perubahan pada file komponen (.tsx, .jsx) untuk auto-refresh.');
log('- Simpan perubahan pada file style (.css, .scss) untuk auto-refresh.');
log('- Tekan Ctrl+C untuk menghentikan pemantauan.');

// Tangani signal untuk keluar dengan rapi
process.on('SIGINT', () => {
  log('Menghentikan pemantauan...');
  watcher.close().then(() => {
    log('Pemantauan dihentikan.');
    process.exit(0);
  });
}); 