import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      // optional: proxy WS too, then you can use ws://localhost:5173/ws
      // '/ws': {
      //   target: 'ws://localhost:3003',
      //   changeOrigin: true,
      //   ws: true,
      // },
    },
  },
})
