import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pocato/',
  optimizeDeps: {
    exclude: ['@sangwonl/pocato-core', '@sangwonl/pocato-react'],
  },
})
