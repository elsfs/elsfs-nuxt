import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [fileURLToPath(new URL('./src/assets/theme.css', import.meta.url))],
  devtools: { enabled: true },
  compatibilityDate: "latest"
})
