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

    // 自动导入 elsfs 后台的请求方法与出入参类型（与 `api-types/elsfs` 子路径同源）。
    // 注意：
    // - addImports 只接受 Import 对象（`addImports(string)` 会在 unimport 里抛
    //   `Cannot create property 'as' on string`），扫描目录要用 addImportsDir；
    // - 旧的 `src/api`（vben 迁入层）引用了仓库中不存在的 `@vben/types`、
    //   `lodash/debounce`，无法编译，不能纳入自动导入，这里改指向可编译的
    //   `runtime/elsfs`。
    addImportsDir(resolver.resolve('./api'))
  },
})
