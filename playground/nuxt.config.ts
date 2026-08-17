export default defineNuxtConfig({
  modules: ['my-module',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@module-federation/nuxt',
    '@pinia/nuxt',
  ],
  $development: undefined, $env: undefined, $meta: undefined, $production: undefined,
  $test: undefined,
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
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false,
  },
  experimental: {
    viewTransition: true, // 如果设置为 true，Nuxt 会在用户浏览器匹配 prefers-reduced-motion: reduce 时不应用过渡（推荐）。如果设置为 'always'，Nuxt 将始终应用过渡，由你来决定是否尊重用户的偏好。
  },
  compatibilityDate: 'latest',
  eslint: {
    checker: true,
    config: {
      stylistic: true,
    },
  },
  fonts: false,
  moduleFederation: {
    config: {
      name: 'remote', // 远程应用名称
      // dev 模式下把 host 初始化注入到 Nuxt 入口模块而非首个虚拟模块，
      // 避免包装 virtual:nuxt:.nuxt/nuxt.config.mjs 导致丢失 appId 等具名导出
      hostInitInjectLocation: 'entry',
    },
  },
  myModule: {},
})
