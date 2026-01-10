// SỬA THÀNH (Dành cho React 18)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() // <--- Chỉ để đơn giản thế này thôi
  ],

  server: {
    port: 5173, // giữ port hiện tại
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // địa chỉ backend Laravel của bạn
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
