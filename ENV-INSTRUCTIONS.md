# Instruksi Konfigurasi Supabase

## Masalah
Aplikasi ASN Dashboard mengalami masalah setelah login dan refresh halaman yang disebabkan oleh konfigurasi Supabase yang tidak valid atau rusak.

## Solusi
Buat file `.env` di direktori root proyek dengan kredensial Supabase yang benar:

```
VITE_SUPABASE_URL=https://tmtdduuuvwafncifrved.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdGRkdXV1dndhZm5jaWZydmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjYwNDYsImV4cCI6MjA2MjY0MjA0Nn0.QeV15o1xoDsoVs7VecEJzJZ4un5SgtpcLWa1-07gDZo
VITE_API_BASE_URL=/api
```

## Langkah-langkah
1. Buka direktori root proyek ASN Dashboard
2. Buat file baru bernama `.env` (pastikan dimulai dengan titik)
3. Copy-paste konfigurasi di atas ke dalam file tersebut
4. Simpan file
5. Restart aplikasi

## Catatan
- File `.env` harus berada di direktori root proyek (sama level dengan package.json)
- File ini tidak boleh di-commit ke Git untuk alasan keamanan
- Pastikan tidak ada spasi sebelum atau sesudah tanda `=` 