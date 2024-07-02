// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  
  nitro: { compressPublicAssets: true },

  modules: [
    ['@nuxtjs/tailwindcss']
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
