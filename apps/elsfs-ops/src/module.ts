import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

/** 模块配置项 */
export interface ModuleOptions {
  /** 是否注册系统管理页面路由，默认 `true`；只要模块不带页面时可设为 `false` */
  pages?: boolean
}

/**
 * 系统管理页面模块。
 *
 * 页面放在 `src/runtime/pages/<分组>/<页面>/index.vue`，构建后以
 * `/<分组>/<页面>` 的形式注册到使用方应用的路由里（例如
 * `pages/system/user/index.vue` → `/system/user`）。
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'elsfs-ops',
    configKey: 'elsfsOps',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    pages: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const pagesDir = resolver.resolve('./runtime/pages')

    // 扫描 runtime/pages 下两级目录，把每个 `<页面>/index.vue` 注册成一条路由
    if (options.pages !== false) {
      extendPages((pages) => {
        if (!existsSync(pagesDir)) return

        for (const group of readdirSync(pagesDir, { withFileTypes: true })) {
          if (!group.isDirectory()) continue

          const groupDir = join(pagesDir, group.name)
          for (const page of readdirSync(groupDir, { withFileTypes: true })) {
            if (!page.isDirectory()) continue

            const file = join(groupDir, page.name, 'index.vue')
            if (!existsSync(file)) continue

            pages.push({
              name: `${group.name}-${page.name}`,
              path: `/${group.name}/${page.name}`,
              file,
            })
          }
        }
      })
    }

    // 页面运行时代码在模块 runtime 里 import `vue` / `element-plus`（含自动导入组件），
    // 确保解析到使用方应用根目录下的实例，避免出现第二份 Vue / Element Plus。
    nuxt.options.vite.resolve ||= {}
    nuxt.options.vite.resolve.dedupe ||= []
    nuxt.options.vite.resolve.dedupe.push('vue', 'element-plus')
  },
})
