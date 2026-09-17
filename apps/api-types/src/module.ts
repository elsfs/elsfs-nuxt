import { defineNuxtModule, addPlugin, createResolver, addImportsDir } from '@nuxt/kit'

// Module options TypeScript interface definition
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- 模块选项接口刻意留空，供使用者按需扩展
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
    // 自动导入 src/api 下所有导出的请求方法
    // 注意：addImports 只接受 Import 对象（`addImports(string)` 会在 unimport 里抛
    // `Cannot create property 'as' on string`），扫描目录要用 addImportsDir
    addImportsDir(resolver.resolve('./api'))
  },
})
