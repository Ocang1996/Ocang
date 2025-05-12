import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook untuk menggunakan Web Worker dengan aman
 * @param workerScript - Path ke worker script
 * @returns Object dengan fungsi untuk mengirim pesan ke worker dan hasil dari worker
 */
export default function useWorker<T = any>(workerScript?: string) {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  // Cleanup worker pada unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Fungsi untuk mengirim pesan ke worker
  const postMessage = (message: any) => {
    setLoading(true);
    setError(null);

    // Buat worker baru jika belum ada atau script berubah
    if (!workerRef.current && workerScript) {
      try {
        workerRef.current = new Worker(new URL(workerScript, import.meta.url), { type: 'module' });
        
        // Setup event handler untuk menerima hasil dari worker
        workerRef.current.onmessage = (event) => {
          setResult(event.data);
          setLoading(false);
        };
        
        // Setup error handler
        workerRef.current.onerror = (event) => {
          console.error('Worker error:', event);
          setError(new Error('Error in worker: ' + event.message));
          setLoading(false);
        };
      } catch (err) {
        console.error('Error creating worker:', err);
        setError(err instanceof Error ? err : new Error('Error creating worker'));
        setLoading(false);
        return;
      }
    }

    // Kirim pesan ke worker jika worker tersedia
    if (workerRef.current) {
      workerRef.current.postMessage(message);
    } else {
      setError(new Error('Worker not available'));
      setLoading(false);
    }
  };

  /**
   * Fungsi run untuk menjalankan tugas di worker
   * @param action - Nama aksi/metode yang akan dijalankan di worker
   * @param data - Data yang akan diproses oleh worker
   */
  const run = (action: string, data?: any) => {
    postMessage({
      action,
      data
    });
  };

  return {
    result,
    error,
    loading,
    postMessage,
    run, // Alias untuk keseragaman dengan kode lama
    runWorker: run // Alias untuk kompatibilitas dengan kode lama
  };
}
