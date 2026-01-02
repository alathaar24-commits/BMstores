import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',          // ⬅️ TAMBAHKAN INI
  plugins: [react()],
})
