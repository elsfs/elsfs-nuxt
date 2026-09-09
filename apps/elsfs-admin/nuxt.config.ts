export default defineNuxtConfig({
  extends: ['tailwind-config'],
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxtjs/i18n', '@element-plus/nuxt', '@nuxtjs/color-mode'],
  $development: undefined, $env: undefined, $meta: undefined, $production: undefined, $test: undefined,
  devtools: { enabled: true },
  app: {
    // 自动应用过渡效果。
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: '应用名称',
      htmlAttrs: {
        lang: 'zh_CN',
      },
    },
  },
  css: [
    '~~/assets/css/main.css',
    '~~/assets/css/tokens.css',
  ],
  experimental: {
    // 如果设置为 true，Nuxt 会在用户浏览器匹配 prefers-reduced-motion: reduce 时不应用过渡（推荐）。
    // 如果设置为 'always'，Nuxt 将始终应用过渡，由你来决定是否尊重用户的偏好。
    viewTransition: true,
  },
  compatibilityDate: 'latest',
  nitro: {
    logLevel: 'info', // 或 'warn' 减少输出
  },
  eslint: {
    checker: true,
    config: {
      stylistic: true,
    },
  },
  i18n: {
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  }
})