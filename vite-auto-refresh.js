// Custom Vite plugin untuk meningkatkan auto-refresh
// Simpan file ini di root project

/**
 * Plugin untuk memperkuat kemampuan auto-refresh pada Vite
 * @returns {import('vite').Plugin}
 */
export default function autoRefreshPlugin() {
  return {
    name: 'vite-plugin-auto-refresh',
    configureServer(server) {
      // Konfigurasi tambahan untuk server
      return () => {
        server.middlewares.use((req, res, next) => {
          // Tambahkan header untuk mencegah caching
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          next();
        });
      };
    },
    handleHotUpdate({ file, server }) {
      // Refresh seluruh halaman untuk tipe file tertentu
      if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.less')) {
        // Kirim event untuk me-refresh seluruh halaman
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
        return [];
      }
      
      // Refresh komponen untuk perubahan file JavaScript/TypeScript
      if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts')) {
        // Biarkan Vite menangani HMR untuk file ini
        return;
      }
      
      // Untuk file lain seperti gambar, font, dll., refresh seluruh halaman
      server.ws.send({
        type: 'full-reload',
        path: '*'
      });
      return [];
    }
  };
} 