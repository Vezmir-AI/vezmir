import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  ssr: false,
  nitro: { compressPublicAssets: true },

  modules: [
    ['@nuxtjs/tailwindcss','@nuxt/eslint',]
  ],

  app: {
    head: {
      title: 'VesmirAI',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }
      ],
      meta: [
        { hid: 'description', name: 'description', content: 'VesmirAI Chatbot' },
      ]
    }
  }
})
