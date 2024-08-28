import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  components: {
    global: true,
    dirs: ['~/components'],
  },
  app: {
    head: {
      title: 'TW Tools | Make it easy to manage your TW adventures',
    },
  },
})
