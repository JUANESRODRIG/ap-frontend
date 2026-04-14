import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/n8n-api': {
        target: 'https://n8n.sofiatechnology.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-api/, ''),
      },
    },
  },
})
