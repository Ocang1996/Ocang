import React from 'react';
import SupabaseFixIssue from '../components/debug/SupabaseFixIssue';

const SupabaseDebugPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupabaseFixIssue />
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cara Perbaikan Error</h2>
          <p className="mb-3">
            Alat ini akan mencoba memperbaiki masalah yang terlihat pada pengujian end-to-end Supabase dengan:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Membuat tabel <code>leaves</code> jika belum ada</li>
            <li>Memeriksa dan menambahkan kolom yang hilang</li>
            <li>Memperbaiki nama kolom yang tidak sesuai (dari camelCase ke snake_case)</li>
            <li>Menerapkan kebijakan Row Level Security (RLS) jika diizinkan</li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-1">Catatan Penting</h3>
            <p className="text-sm text-yellow-700">
              Fungsi <code>rpc</code> yang digunakan memerlukan izin SQL eksekusi dari Supabase.
              Jika mendapatkan error tentang izin, Anda mungkin perlu membuat fungsi SQL tersebut
              di dashboard Supabase atau menggunakan SQL editor langsung.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pengujian Ulang</h2>
        <p className="mb-3">
          Setelah perbaikan selesai, Anda dapat menjalankan pengujian ulang melalui halaman 
          <a href="/supabase-test" className="text-blue-600 hover:underline ml-1">Pengujian Supabase</a>.
        </p>
        
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => window.location.href = '/supabase-test'}
        >
          Buka Halaman Pengujian
        </button>
      </div>
    </div>
  );
};

export default SupabaseDebugPage; 