import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            console.log('[Vite Dev Proxy] Configured proxy for /api -> http://localhost:3000');
            proxy.on('error', (err, req, res) => {
              console.error(`[Vite Dev Proxy Error] Error proxying ${req?.method} ${req?.url}:`, err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`[Vite Dev Proxy -> Backend] ${req.method} ${req.url} -> http://localhost:3000${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`[Vite Dev Proxy <- Backend] Response for ${req.method} ${req.url} [Status: ${proxyRes.statusCode}, Content-Type: ${proxyRes.headers['content-type']}]`);
            });
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
