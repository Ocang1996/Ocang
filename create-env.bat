@echo off
echo Membuat file .env dengan konfigurasi Supabase yang benar...

(
echo VITE_SUPABASE_URL=https://tmtdduuuvwafncifrved.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo
echo VITE_API_BASE_URL=/api
) > .env

echo.
echo File .env berhasil dibuat!
echo.
echo Isi file:
type .env
echo.
echo Selanjutnya, restart aplikasi ASN Dashboard untuk menerapkan perubahan.
echo.
pause 