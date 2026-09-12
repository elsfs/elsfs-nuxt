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
    description: 'Nuxt Content is a git-based CMS for Nuxt projects.',
    notes: [
      'The documentation only includes Nuxt Content v3 docs.',
      'The content is automatically generated from the same source as the official documentation.',
    ],
    full: {
      title: 'Complete Documentation',
      description: 'The complete documentation including all content',
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
