// @ts-check
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  optimizeDeps: {
    include: ['focus-trap', 'focus-trap-vue'],
  },
  plugins: [Vue(), tailwindcss()],
})
