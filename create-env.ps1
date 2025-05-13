# Script untuk membuat file .env dengan konfigurasi Supabase yang benar
# Jalankan script ini di PowerShell dengan perintah: .\create-env.ps1

$envContent = @"
VITE_SUPABASE_URL=https://tmtdduuuvwafncifrved.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo
VITE_API_BASE_URL=/api
"@

# Pastikan untuk menggunakan encoding UTF-8 tanpa BOM
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host "File .env berhasil dibuat di direktori saat ini!" -ForegroundColor Green
Write-Host "Isi file:"
Get-Content ".env"

Write-Host "`nSelanjutnya, restart aplikasi ASN Dashboard untuk menerapkan perubahan." -ForegroundColor Yellow 