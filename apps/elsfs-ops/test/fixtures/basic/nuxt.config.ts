import ElsfsOps from '../../../src/module'

export default defineNuxtConfig({
  modules: [ElsfsOps],
  // 模块的页面依赖使用方应用里的 utils / composables，fixture 里只验证模块能加载
  elsfsOps: { pages: false },
})
