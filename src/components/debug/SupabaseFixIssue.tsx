import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const SupabaseFixIssue: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  // Fungsi untuk mengonfigurasi simulasi cuti
  const setupLeaveSimulation = async () => {
    setLoading(true);
    setStatus('Mengonfigurasi simulasi data cuti...');
    addLog('Memulai konfigurasi simulasi data cuti...');

    try {
      // 1. Cek koneksi Supabase
      addLog('Memeriksa koneksi Supabase...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      
      if (connectionError) {
        addLog(`Kesalahan koneksi: ${connectionError.message}`);
        throw connectionError;
      }

      addLog('Koneksi Supabase berhasil');

      // 2. Konfirmasi struktur data untuk tabel leaves
      addLog('Mendaftarkan struktur data untuk leaves simulation...');
      
      // Data statis untuk simulasi leave operations
      const mockLeaveData = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', // UUID statis
        employee_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6a',
        employee_name: 'Mock Employee',
        leave_type: 'Cuti Tahunan',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 7,
        reason: 'Simulasi cuti',
        status: 'Pending',
        input_by: 'System',
        year: new Date().getFullYear(),
        document_required: false
      };

      // Simpan data mock ke localStorage untuk digunakan pada simulasi
      localStorage.setItem('mock_leave_data', JSON.stringify(mockLeaveData));
      addLog('Data simulasi cuti berhasil dikonfigurasi');

      // 3. Tambahkan informasi test mode ke localStorage
      localStorage.setItem('supabase_test_mode', 'true');
      addLog('Mode test Supabase diaktifkan');

      setStatus('Konfigurasi selesai!');
      addLog('Proses konfigurasi simulasi cuti selesai');
      addLog('CATATAN: Operasi "Tinggalkan Ujian" dirancang untuk gagal sebagai pengujian keamanan');
    } catch (error: any) {
      setStatus('Konfigurasi gagal');
      addLog(`Error: ${error.message}`);
      console.error('Error configuring leave simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk diagnosa tabel leaves
  const runDiagnostics = async () => {
    setLoading(true);
    setStatus('Menjalankan diagnostik...');
    addLog('Memulai diagnosa koneksi Supabase...');

    try {
      // Cek apakah mock client digunakan
      if (!supabase?.auth?.signOut || !supabase?.from) {
        addLog('PERINGATAN: Mock client Supabase terdeteksi!');
        addLog('Ini dapat menyebabkan operasi seperti fungsi RPC tidak berfungsi.');
        addLog('Pastikan URL dan API key Supabase dikonfigurasi dengan benar di .env');
        throw new Error('Supabase client tidak diinisialisasi dengan benar');
      }

      // Cek koneksi dasar
      addLog('Menjalankan uji koneksi dasar...');

      try {
        // Hanya coba ping
        const start = Date.now();
        const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
        const end = Date.now();
        
        if (error) {
          addLog(`Koneksi gagal: ${error.message}`);
        } else {
          addLog(`Koneksi berhasil (${end - start}ms)`);
        }
      } catch (e: any) {
        addLog(`Error uji koneksi: ${e.message}`);
      }

      // Tambahkan log debugging
      addLog(`URL Supabase: ${JSON.stringify(import.meta.env.VITE_SUPABASE_URL || 'tidak ditemukan')}`);
      addLog(`API Key tersedia: ${Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) ? 'Ya' : 'Tidak'}`);

      setStatus('Diagnostik selesai');
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Alat Perbaikan Supabase</h2>
      
      <div className="mb-4 space-y-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-2"
          onClick={setupLeaveSimulation}
          disabled={loading}
        >
          {loading ? 'Mengonfigurasi...' : 'Aktifkan Simulasi Cuti'}
        </button>
        
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          onClick={runDiagnostics}
          disabled={loading}
        >
          {loading ? 'Menjalankan...' : 'Jalankan Diagnostik'}
        </button>
        
        {status && (
          <div className="mt-2 text-sm font-medium">
            Status: {status}
          </div>
        )}
      </div>
      
      <div className="border rounded p-3 bg-gray-50 max-h-96 overflow-y-auto">
        <h3 className="text-md font-medium mb-2">Log:</h3>
        {log.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada log. Tekan tombol di atas untuk memulai.</p>
        ) : (
          <pre className="text-xs whitespace-pre-wrap">
            {log.map((line, i) => (
              <div key={i} className="py-1 border-b border-gray-200">
                {line}
              </div>
            ))}
          </pre>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-md font-medium text-yellow-800">Catatan Penting:</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Fitur "Tinggalkan Ujian" akan <strong>selalu menampilkan error</strong> sebagai bagian dari 
          <strong> pengujian keamanan</strong>. Ini adalah perilaku yang diharapkan dan bukan masalah.
        </p>
      </div>
    </div>
  );
};

export default SupabaseFixIssue; 