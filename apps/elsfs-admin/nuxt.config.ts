import { fileURLToPath } from 'node:url'

import Sonda from 'sonda/nuxt'

/**
 * `nuxt dev` 启动时 NODE_ENV 为 development，`nuxt build` 为 production。
 *
 * dev 下直接从 workspace 里其它包的源码加载（而不是各自构建好的 `dist/`），改组件、
 * 页面或公共包源码会立即 HMR，不用手动重建 dist；生产构建仍走各包 package.json 指向的
 * `dist/` 产物，两边行为通过这里显式区分。
 */
const isDev = process.env.NODE_ENV === 'development'
const workspacePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineNuxtConfig({
  extends: ['tailwind-config'],
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/color-mode',
    // dev 下按源码路径加载模块：模块内 createResolver(import.meta.url) 会解析到
    // src/runtime，组件 / 页面源码改动即时生效；生产构建按包名加载 dist 产物。
    isDev ? workspacePath('../elsfs-components/src/module.ts') : 'elsfs-components',
    isDev ? workspacePath('../elsfs-ops/src/module.ts') : 'elsfs-ops',
    Sonda(),
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
  // 后端地址（可用 NUXT_PUBLIC_API_BASE 覆盖，见 .env.example）
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:6002',
    },
  },
  // Element Plus 的日期组件依赖 CJS 版 dayjs；应用没把它装成直接依赖时 Vite 解析不到，
  // 浏览器会直接 import CJS 报 "does not provide an export named 'default'"。
  // dayjs 已加入 dependencies，这里再显式声明一次，确保进 Vite 依赖预构建。
  vite: {
    optimizeDeps: {
      include: ['dayjs'],
    },
    // dev 下把公共包（api-types / nuxt-request）的子路径导入指到源码，改完即时生效；
    // 生产构建仍按 package.json 的 exports 走 dist 入口。
    resolve: {
      alias: isDev
        ? {
            'api-types/elsfs': workspacePath('../api-types/src/api/elsfs/index.ts'),
            'api-types/request': workspacePath('../api-types/src/api/request.ts'),
            'nuxt-request/runtime': workspacePath(
              '../../packages/nuxt-request/src/runtime/utils/index.ts',
            ),
          }
        : {},
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
  sourcemap: {
    client: true,
  },
})
