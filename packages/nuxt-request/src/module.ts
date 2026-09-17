import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

// Module options TypeScript interface definition
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-request',
    configKey: 'nuxtRequest',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.js` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})

/**
 * 公共 API 不从这里导出，而是通过 `nuxt-request/runtime` 子路径（见 package.json `exports`）。
 *
 * 原因：
 * - Nuxt 会禁止 app 代码直接 import 已安装模块的入口（`_installedModules` 导入保护），
 *   根入口只应包含构建期 setup 逻辑；
 * - 不使用 `addImportsDir` 自动导入：它会递归扫描 `runtime/utils`，把 `util.ts` 等内部
 *   实现一并注册成全局自动导入，污染用户应用的命名空间。
 *
 * 运行时 API 的正确用法：`import { RequestClient } from 'nuxt-request/runtime'`
 */
