import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages 部署在 /Render-test/ 路徑下
  base: mode === 'production' ? '/Render-test/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/restaurants': 'http://127.0.0.1:8000',
      '/cart': 'http://127.0.0.1:8000',
      '/orders': 'http://127.0.0.1:8000',
      '/reviews': 'http://127.0.0.1:8000',
      '/coupons': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
    }
  }
}))
