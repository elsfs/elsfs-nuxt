import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineNuxtConfig({
  extends: ['tailwind-config'],
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],
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
  css: ['~~/assets/css/main.css'],
  experimental: {
    // 如果设置为 true，Nuxt 会在用户浏览器匹配 prefers-reduced-motion: reduce 时不应用过渡（推荐）。
    // 如果设置为 'always'，Nuxt 将始终应用过渡，由你来决定是否尊重用户的偏好。
    viewTransition: true,
  },
  compatibilityDate: 'latest',
  nitro: {
    logLevel: 'info', // 或 'warn' 减少输出
  },
  hooks: {
    'render:html': (html) => {
      // 读取加载动画 HTML
      let loadingHtml = ''

      try {
        // 根据环境选择文件
        const isAntd = process.env.USE_ANTD_LOADING === 'true'
        const fileName = isAntd ? 'default-loading-antd.html' : 'default-loading.html'
        const filePath = join(process.cwd(), 'src/plugins/inject-app-loading', fileName)
        loadingHtml = readFileSync(filePath, 'utf-8')
        // 替换标题
        loadingHtml = loadingHtml.replace(/%VITE_APP_TITLE%/g, 'My App')
      }
      catch (error) {
        console.warn('加载动画文件不存在，使用默认样式')
        // 备用加载动画
        loadingHtml = `
          <style>
            .loading-fallback {
              position: fixed;
              top: 0;
              left: 0;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: #f4f7f9;
            }
            .loading-fallback .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e0e0e0;
              border-top-color: #1890ff;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
          <div class="loading-fallback" id="__app-loading__">
            <div class="spinner"></div>
          </div>
        `
      }

      // 插入到 #__nuxt 之前
      const nuxtIndex = html.body.findIndex(item =>
        typeof item === 'string' && item.includes('__nuxt'),
      )

      if (nuxtIndex !== -1) {
        html.body.splice(nuxtIndex, 0, loadingHtml)
      }
      else {
        html.body.unshift(loadingHtml)
      }
    },
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
