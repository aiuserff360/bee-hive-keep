import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works at any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
