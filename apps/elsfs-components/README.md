# elsfs-components

`elsfs-admin` 的公共 UI 组件 Nuxt 模块：把列表页里反复出现的「卡片外壳 / 查询表单 / 表格 / 分页」以及图标组件集中到一处，应用侧通过 Nuxt 自动导入直接使用。

## 组件

| 组件                 | 文件                                              | 说明                                                    |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| `AppIcon`            | `src/runtime/components/AppIcon.vue`              | 统一图标入口：iconify（本地图标集）与 Element Plus 图标 |
| `AdminContainerCard` | `src/runtime/components/admin/container-card.vue` | 查询 / 列表 / 表单的卡片外壳                            |
| `AdminSearchForm`    | `src/runtime/components/admin/search-form.vue`    | 配置驱动的搜索表单                                      |
| `AdminTable`         | `src/runtime/components/admin/table.vue`          | `ElTable` 薄封装（默认 `fill` 撑满父容器）              |
| `AdminPagination`    | `src/runtime/components/admin/pagination.vue`     | `ElPagination` 薄封装                                   |

布局（`app/layouts/`）专用组件不在此模块内，仍留在各自应用里。

`SearchFormField` 等类型通过子路径导出：

```ts
import type { SearchFormField } from 'elsfs-components/types/search-form'
```

## 使用

应用需要自带 `@element-plus/nuxt`（Element Plus 组件由它自动导入）与 Tailwind v4，并完成两步接入：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['elsfs-components'],
})
```

```css
/* assets/css/main.css */
@import 'tailwindcss';
/* 把模块组件目录登记为 Tailwind source，模块里独有的工具类才会生成 */
@import 'elsfs-components/styles.css';
```

`vue` / `element-plus` / `@element-plus/icons-vue` 是 peer 依赖；模块会通过 Vite `resolve.dedupe` 保证运行时只有一份实例。

## 开发

```bash
pnpm dev          # 构建 stub 并启动 playground
pnpm dev:prepare  # 只生成 stub / 类型
pnpm prepack      # 构建 dist（postinstall 也会自动构建）
pnpm lint
pnpm fmt
```

源码在 `src/`：`src/module.ts` 注册组件目录，`src/runtime/**` 会原样构建到 `dist/runtime/**`。
