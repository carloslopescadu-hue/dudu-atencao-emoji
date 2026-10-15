import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No GitHub Pages o site fica em /<nome-do-repo>/; o deploy define BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
})
