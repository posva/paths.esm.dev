import NuxtConfiguration from '@nuxt/config'

const features = ['Array.from'].join('%2C')

const config: NuxtConfiguration = {
  mode: 'universal',
  head: {
    title: 'Vue Router Path Ranker',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'A Vue Router path ranker',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: 'site.webmanifest' },
    ],
    script: [
      {
        src: `https://polyfill.io/v3/polyfill.min.js?features=${features}`,
        body: true,
        type: 'application/javascript',
      },
    ],
  },

  loading: { color: '#90cdf4' },

  devModules: ['@nuxtjs/tailwindcss'],

  build: {
    // doesn't seem to work, maybe because TS?
    // babel: {
    //   presets: [
    //     [
    //       '@nuxt/babel-preset-app',
    //       {
    //         targets: {
    //           browsers: ['last 1 version', 'not dead', '> 1%'],
    //         },
    //       },
    //     ],
    //   ],
    // },
    /*
     ** You can extend webpack config here
     */
  },
}

export default config
