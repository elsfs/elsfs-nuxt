/**
 * 这份配置不参与运行，只用于生成模块自己的 `.nuxt` 类型：
 * `postinstall` 里的 `nuxt-module-build prepare` 会以本包为 rootDir 跑一次 `nuxt prepare`，
 * 并额外加载 `src/module.ts`（登记本模块的 `AppIcon` / `EleXxx` 组件）。
 *
 * 组件模板里用到的 `<ElXxx>` 组件由宿主应用的 `@element-plus/nuxt` 自动导入，模块自己的
 * `.nuxt` 类型默认只有 Nuxt 内置组件，导致 IDE 里编辑 `src/runtime/components/**` 时
 * 这些组件没有智能提示。这里把 `@element-plus/nuxt` 也挂进来，生成的 `components.d.ts`
 * 就包含 Element Plus 的组件类型。
 */
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
})
