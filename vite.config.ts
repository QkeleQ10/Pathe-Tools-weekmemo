import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Set the correct base when deploying to GitHub Pages under /Pathe-Tools-weekmemo/
  base: '/Pathe-Tools-weekmemo/',
  plugins: [vue()],
})
