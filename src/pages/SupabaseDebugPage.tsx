import React, { useState, useEffect } from 'react';
import SupabaseFixIssue from '../components/debug/SupabaseFixIssue';
import { supabase } from '../lib/supabase';

const SupabaseDebugPage: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<{ [key: string]: string }>({});
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    // Cek informasi lingkungan
    const env = {
      'Supabase URL': import.meta.env.VITE_SUPABASE_URL || 'Tidak diatur',
      'API Key Tersedia': import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Ya' : 'Tidak',
      'Mode Aplikasi': import.meta.env.MODE || 'development',
      'Simulasi Aktif': localStorage.getItem('supabase_test_mode') ? 'Ya' : 'Tidak',
    };
    setEnvInfo(env);

    // Cek koneksi Supabase
    const checkConnection = async () => {
      try {
        const start = Date.now();
        const { data, error } = await supabase
          .from('users')
          .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorDetails(error.message);
        } else {
          setConnectionStatus('success');
          console.log('Supabase connection successful in', Date.now() - start, 'ms');
        }
      } catch (err: any) {
        console.error('Connection test error:', err);
        setConnectionStatus('error');
        setErrorDetails(err.message);
      }
    };

    checkConnection();
  }, []);

  const resetTestMode = () => {
    localStorage.removeItem('supabase_test_mode');
    localStorage.removeItem('mock_leave_data');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Alat Diagnostik Supabase</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status Koneksi</h2>
        {connectionStatus === 'checking' && (
          <div className="flex items-center text-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memeriksa koneksi Supabase...
          </div>
        )}
        {connectionStatus === 'success' && (
          <div className="flex items-center text-green-600">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Terhubung ke Supabase
          </div>
        )}
        {connectionStatus === 'error' && (
          <div>
            <div className="flex items-center text-red-600">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Gagal terhubung ke Supabase
            </div>
            {errorDetails && (
              <div className="mt-2 p-3 bg-red-50 text-red-800 text-sm rounded-md">
                {errorDetails}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-medium mb-2">Informasi Lingkungan:</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(envInfo).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="py-2 font-medium">{key}</td>
                  <td className="py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupabaseFixIssue />
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pemecahan Masalah</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">1. Error Saat Refresh</h3>
              <p className="text-sm text-gray-600 mt-1">
                Jika Anda mengalami error setelah login dan refresh halaman, penyebabnya kemungkinan adalah:
              </p>
              <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-gray-700">
                <li>Variabel lingkungan Supabase tidak dikonfigurasi dengan benar</li>
                <li>Token sesi Supabase telah kedaluwarsa</li>
                <li>Masalah CORS dengan Supabase</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">2. Error "Tinggalkan Ujian"</h3>
              <p className="text-sm text-gray-600 mt-1">
                Error ini <strong>diharapkan</strong> sebagian dari pengujian keamanan. Fitur ini dirancang untuk gagal ketika pengguna mencoba meninggalkan ujian tanpa izin.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">3. Error "Tidak mendapatkan data karyawan"</h3>
              <p className="text-sm text-gray-600 mt-1">
                Aktifkan "Simulasi Cuti" untuk mengatasi masalah ini dengan menyediakan data pengujian yang valid.
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={resetTestMode}
            >
              Reset Mode Pengujian
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pengujian Supabase</h2>
        <p className="mb-3">
          Jalankan pengujian end-to-end untuk memastikan integrasi Supabase berfungsi dengan benar.
        </p>
        
        <div className="flex space-x-4">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => window.location.href = '/supabase-test'}
          >
            Mulai Pengujian
          </button>
          
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => window.location.href = '/'}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebugPage; 