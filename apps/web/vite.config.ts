import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    proxy: {
      '/api': env.API_PROXY_TARGET ?? 'http://127.0.0.1:3333',
    },
  },
})
