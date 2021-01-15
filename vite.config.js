// @ts-check
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  optimizeDeps: {
    include: ['focus-trap', 'focus-trap-vue'],
  },
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'Vue Router Path Parser',
        short_name: 'Path Parser',
        description:
          'Path Parser used by Vue Router to transform paths into regexps and sort them',
        start_url: '/',
        scope: '/',
        orientation: 'any',
        lang: 'English',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
      },
    }),
  ],
})
