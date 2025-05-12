import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoRefreshPlugin from './vite-auto-refresh.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    autoRefreshPlugin()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  typescript: {
    checker: {
      overlay: {
        initialIsOpen: false,
        position: 'br',
        enableBadge: false,
      },
    },
  },
});
