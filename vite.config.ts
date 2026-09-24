import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Keep built assets relative so the site works under /kz/ and custom domains.
  base: './',
  plugins: [react()],
})
