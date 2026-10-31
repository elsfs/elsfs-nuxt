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

    // 组件采用「一个文件夹一个组件」的结构，文件夹名就是组件名（`app-icon/index.vue` →
    // `<AppIcon>`）。`pathPrefix: false` 取消目录层级带来的路径前缀，只按文件夹名命名。
    // 本项目对 Element Plus 的封装文件夹统一以 `ele-` 开头，文件夹名即组件名，
    // 因此组件名带 `Ele` 前缀：`ele-table/index.vue` → `<EleTable>`。
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
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
