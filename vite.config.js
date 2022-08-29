// @ts-check
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  optimizeDeps: {
    include: ['focus-trap', 'focus-trap-vue'],
  },
  plugins: [Vue()],
})
