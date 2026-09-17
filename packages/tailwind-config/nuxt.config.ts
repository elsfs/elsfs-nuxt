import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  css: [fileURLToPath(new URL('./src/assets/theme.css', import.meta.url))],
  compatibilityDate: 'latest',
})
