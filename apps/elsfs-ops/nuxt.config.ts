import { fileURLToPath } from 'node:url'

/**
 * 这份配置不参与运行，只用于生成模块自己的 `.nuxt` 类型（IDE 用）：
 * postinstall 里会跑一次 `nuxt prepare`，把宿主应用 `elsfs-admin` 的别名与自动导入也
 * 纳入类型生成，这样编辑 `src/runtime/pages/**` 时 `useApi`、`ElMessage`、`onMounted`、
 * `~/utils/*` 等都有提示。运行时这些仍由宿主应用提供。
 */
const adminApp = fileURLToPath(new URL('../elsfs-admin/app', import.meta.url))

export default defineNuxtConfig({
  modules: ['./src/module', 'elsfs-components', '@element-plus/nuxt'],
  alias: {
    '~': adminApp,
    '@': adminApp,
  },
  imports: {
    dirs: [
      fileURLToPath(new URL('../elsfs-admin/app/composables', import.meta.url)),
      fileURLToPath(new URL('../elsfs-admin/app/utils', import.meta.url)),
    ],
  },
  typescript: { builder: 'shared' },
})
