import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'retail-excellence-knights-infants.trycloudflare.com',
      '.trycloudflare.com',
      'localhost',
      '127.0.0.1',
      '192.168.1.49'
    ],
    port: 5174
  }
})
