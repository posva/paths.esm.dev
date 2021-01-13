// @ts-check
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  optimizeDeps: {
    include: ['focus-trap', 'focus-trap-vue'],
  },
  plugins: [vue()],
})
