export default defineNuxtConfig({
  extends: ['tailwind-config'],
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/color-mode',
  ],
  $development: undefined,
  $env: undefined,
  $meta: undefined,
  $production: undefined,
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
  css: ['~~/assets/css/main.css', '~~/assets/css/tokens.css'],
  experimental: {
    // 如果设置为 true，Nuxt 会在用户浏览器匹配 prefers-reduced-motion: reduce 时不应用过渡（推荐）。
    // 如果设置为 'always'，Nuxt 将始终应用过渡，由你来决定是否尊重用户的偏好。
    viewTransition: true,
  },
  compatibilityDate: 'latest',
  // 后端地址与 mock 开关（可用 NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_USE_MOCK 覆盖，见 .env.example）
  runtimeConfig: {
    public: {
      apiBase: 'http://192.168.0.102:6002',
      useMock: false,
    },
  },
  nitro: {
    logLevel: 'info', // 或 'warn' 减少输出
  },
  elementPlus: {
    // 引入 Element Plus 官方暗色变量（选择器是 html.dark），
    // 否则 el-drawer / el-dropdown 等组件在暗色主题下仍是浅色。
    themes: ['dark'],
    // 组件内置文案跟随应用语言（zh-CN）
    defaultLocale: 'zh-cn',
  },
  eslint: {
    checker: true,
    config: {
      stylistic: true,
    },
  },
})
