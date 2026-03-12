import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://backend:5000',
        changeOrigin: true
      },
      '/public': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})
