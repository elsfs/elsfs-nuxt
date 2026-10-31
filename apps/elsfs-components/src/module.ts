import { addComponentsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'elsfs-components',
    configKey: 'elsfsComponents',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 注册模块内的公共组件（AppIcon、AdminContainerCard / AdminSearchForm / AdminTable /
    // AdminPagination 等），使用方无需再手动 import。
    // 组件命名与 Nuxt 默认规则一致：`components/admin/table.vue` → `<AdminTable>`。
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
    })

    // 组件运行时代码会 import `vue` / `element-plus` / `@element-plus/icons-vue`。
    // 这些包在 workspace 里可能被解析到模块自己的 node_modules，导致运行时出现
    // 第二份 Vue / Element Plus 实例（computed 跨实例失效、ConfigProvider 注入丢失）。
    // 加入 dedupe 后统一解析到使用方应用根目录下的实例。
    nuxt.options.vite.resolve ||= {}
    nuxt.options.vite.resolve.dedupe ||= []
    nuxt.options.vite.resolve.dedupe.push('vue', 'element-plus', '@element-plus/icons-vue')
  },
})
