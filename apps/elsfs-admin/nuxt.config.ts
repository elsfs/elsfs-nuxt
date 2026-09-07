export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],
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
  css: ['~~/assets/css/main.css'],
  ui: {
    fonts: false,
  },
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
  },
  icon: {
    clientBundle: {
      // 扫描源码中的图标用法并打进客户端包，避免运行时按需拉取图标
      // （服务端渲染时相对路径 fetch 会失败，导致 SSR 图标告警）
      scan: true,
    },
  },
  moduleFederation: {
    config: {
      name: 'remote', // 远程应用名称
      // dev 模式下把 host 初始化注入到 Nuxt 入口模块而非首个虚拟模块，
      // 避免包装 virtual:nuxt:.nuxt/nuxt.config.mjs 导致丢失 appId 等具名导出
      hostInitInjectLocation: 'entry',
    },
  },
})
