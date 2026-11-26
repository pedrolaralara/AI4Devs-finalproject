import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  server: {
    strictPort: true,
    proxy: {
      '/api': env.API_PROXY_TARGET ?? 'http://127.0.0.1:3333',
      '/docs': env.API_PROXY_TARGET ?? 'http://127.0.0.1:3333',
    },
  },
})
