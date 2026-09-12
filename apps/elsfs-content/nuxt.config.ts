import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/plausible', '@vueuse/nuxt', '@nuxthub/core', 'nuxt-studio'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Nuxt Content',
    url: 'https://content.nuxt.com',
  },
  fonts: {
    providers: {
      // googleicons 是与 google 并列的独立 provider（提供 Material Symbols 图标字体），
      // 默认启用且字体模块启动时会 eager 初始化，会去 fetch fonts.google.com，
      // 国内网络下必然超时并打印 ERROR。本项目未使用 web font，直接关闭。
      googleicons: false,
      google: false,
      fontsource: false,
      bunny: false,
      fontshare: false,
      adobe: false,
    },
  },
  icon: {
    // docus 默认 provider: 'iconify'，图标会在运行时去 api.iconify.design 拉取，
    // 国内网络下必然超时（[Icon] loading icon ... timed out）并导致图标缺失。
    // 改为使用本地已安装的 @iconify-json/* 集合（server bundle），并禁止回退到 Iconify API。
    provider: 'server',
    serverBundle: 'local',
    fallbackToApi: false,
    clientBundle: {
      // 下面这些图标是运行时拼出来的，静态扫描扫不到，必须显式打进 client bundle：
      // - lucide:terminal 由 @nuxt/ui 的 CodeIcon 按文件名 "Terminal" 映射
      // - lucide:cloud-upload / square-code / square-function 来自 content 的 .navigation.yml
      // - vscode-icons:file-type-* 由 CodeIcon 按代码块文件名的扩展名映射
      icons: [
        'lucide:cloud-upload',
        'lucide:square-code',
        'lucide:square-function',
        'lucide:terminal',
        'vscode-icons:file-type-bun',
        'vscode-icons:file-type-css',
        'vscode-icons:file-type-deno',
        'vscode-icons:file-type-dotenv',
        'vscode-icons:file-type-excel',
        'vscode-icons:file-type-json',
        'vscode-icons:file-type-json2',
        'vscode-icons:file-type-markdown',
        'vscode-icons:file-type-node',
        'vscode-icons:file-type-npm',
        'vscode-icons:file-type-nuxt',
        'vscode-icons:file-type-pnpm',
        'vscode-icons:file-type-typescript',
        'vscode-icons:file-type-vue',
        'vscode-icons:file-type-yaml',
        'vscode-icons:file-type-yarn',
      ],
    },
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: {
          langs: ['docker', 'json'],
        },
      },
    },
  },
  routeRules: {
    ...(readFileSync(resolve(import.meta.dirname, '_redirects'), 'utf-8'))
      .split('\n')
      .filter(line => line.trim().length && !line.trim().startsWith('#'))
      .reduce((acc, line) => {
        const [from, to] = line.split('=') as [string, string]
        return Object.assign(acc, { [from]: { redirect: to } })
      }, {} as Record<string, { redirect: string }>),
  },
  nitro: {
    compatibilityDate: {
      // Don't generate observability routes
      vercel: '2025-07-14',
    },
  },
  hub: {
    db: 'sqlite',
    cache: true,
  },
  llms: {
    domain: 'https://content.nuxt.com',
    title: 'Nuxt Content',
    description: 'Nuxt Content 是面向 Nuxt 项目的基于 Git 的 CMS。',
    notes: [
      '本文档仅包含 Nuxt Content v3 的文档。',
      '内容与官方文档同源，自动生成。',
    ],
    full: {
      title: '完整文档',
      description: '包含全部内容的完整文档',
    },
    contentRawMarkdown: {
      excludeCollections: ['landing'],
    },
  },
  studio: {
    route: '/admin',
    repository: {
      owner: 'nuxt',
      repo: 'content',
      branch: 'main',
      rootDir: 'docs',
    },
  },
})
