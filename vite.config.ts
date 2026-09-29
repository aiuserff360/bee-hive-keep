import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works at any GitHub Pages path.
// Two pages are built: the product (index.html) and the public website (landing/index.html).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html'),
        landing: resolve(import.meta.dirname, 'landing/index.html'),
      },
    },
  },
})
