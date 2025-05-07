# Script PowerShell untuk menjalankan aplikasi ASN Dashboard

# Tampilkan menu navigasi
Write-Host "===== ASN Dashboard BOLT =====" -ForegroundColor Cyan
Write-Host "1. Jalankan Server" -ForegroundColor Green
Write-Host "2. Jalankan Client" -ForegroundColor Green
Write-Host "3. Jalankan Client dengan Auto-Refresh" -ForegroundColor Green
Write-Host "4. Jalankan Client dengan Auto-Refresh dan Watcher" -ForegroundColor Yellow
Write-Host "5. Jalankan Server & Client (terpisah)" -ForegroundColor Green
Write-Host "6. Keluar" -ForegroundColor Red
Write-Host "============================" -ForegroundColor Cyan

# Minta input dari user
$choice = Read-Host "Pilih opsi [1-6]"

switch ($choice) {
    "1" {
        Write-Host "Menjalankan server..." -ForegroundColor Yellow
        Set-Location -Path "$PSScriptRoot\server"
        npm run dev
    }
    "2" {
        Write-Host "Menjalankan client..." -ForegroundColor Yellow
        Set-Location -Path "$PSScriptRoot"
        npm run dev:open
    }
    "3" {
        Write-Host "Menjalankan client dengan auto-refresh..." -ForegroundColor Yellow
        Set-Location -Path "$PSScriptRoot"
        npm run dev:open
    }
    "4" {
        Write-Host "Menjalankan client dengan auto-refresh dan watcher..." -ForegroundColor Yellow
        Set-Location -Path "$PSScriptRoot"
        npm run dev:auto
    }
    "5" {
        Write-Host "Menjalankan server dan client dalam window terpisah..." -ForegroundColor Yellow
        # Jalankan server di window terpisah
        Start-Process powershell -ArgumentList "cd '$PSScriptRoot\server'; npm run dev; Read-Host 'Tekan Enter untuk menutup'"
        
        # Tunggu sebentar agar server sempat starting
        Start-Sleep -Seconds 3
        
        # Jalankan client di window saat ini
        Set-Location -Path "$PSScriptRoot"
        npm run dev:auto
    }
    "6" {
        Write-Host "Keluar dari aplikasi..." -ForegroundColor Red
        return
    }
    default {
        Write-Host "Pilihan tidak valid. Silakan jalankan script lagi." -ForegroundColor Red
    }
}

# Instruksi jika mengalami kendala
Write-Host "`nCatatan: Jika mengalami kendala dengan perintah PowerShell, gunakan salah satu metode berikut:" -ForegroundColor Cyan
Write-Host "- Jalankan server: cd server; npm run dev" -ForegroundColor Yellow
Write-Host "- Jalankan client: npm run dev:open" -ForegroundColor Yellow
Write-Host "- Jalankan client dengan auto-refresh: npm run dev:open" -ForegroundColor Yellow
Write-Host "- Jalankan client dengan auto-refresh dan watcher: npm run dev:auto" -ForegroundColor Yellow
Write-Host "- Gunakan terminal terpisah untuk menjalankan server dan client" -ForegroundColor Yellow 