import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< Updated upstream
    port : 3000,
    proxy : {
      "/api" : {
        target: 'http://localhost:8080',
        changeOrigin: true,
=======
    port: 3000,
    proxy: {
      '/api':{
          target: 'http://localhost:8080',
          changeOrigin: true,
>>>>>>> Stashed changes
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
