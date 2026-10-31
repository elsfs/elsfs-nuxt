/**
 * 这份配置不参与运行，只用于生成模块自己的 `.nuxt` 类型：
 * `postinstall` 里的 `nuxt-module-build prepare` 会以本包为 rootDir 跑一次 `nuxt prepare`，
 * 并额外加载 `src/module.ts`。
 *
 * 模块页面（`src/runtime/pages/**`）在宿主应用里由 `@element-plus/nuxt` 与
 * `elsfs-components` 自动导入 `<ElXxx>`、`<EleXxx>` 组件，但模块自己的 `.nuxt` 类型默认
 * 只有 Nuxt 内置组件，导致 IDE 里编辑页面时没有这些组件的智能提示。这里把两个模块也
 * 挂进来，生成的 `components.d.ts` 就包含它们的组件类型。
 */
export default defineNuxtConfig({
  modules: ['elsfs-components', '@element-plus/nuxt'],
})
