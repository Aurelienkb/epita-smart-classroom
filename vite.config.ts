import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path: 100% compatible with GitHub Pages, Cloudflare Pages, and local dev!
})
