# elsfs-components

`elsfs-admin` 的公共 UI 组件 Nuxt 模块：把列表页里反复出现的「卡片外壳 / 查询表单 / 表格 / 分页」以及图标组件集中到一处，应用侧通过 Nuxt 自动导入直接使用。

## 组件

组件采用「一个文件夹一个组件」的结构：`<folder>/index.vue`，文件夹名就是组件名；组件目录注册时 `pathPrefix: false`，目录层级不参与命名。对 Element Plus 的封装文件夹统一以 `ele-` 开头（如 `ele-table/index.vue`）；文件夹名即组件名，所以这些组件名带 `Ele` 前缀。

| 组件               | 文件                                                  | 说明                                                    |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| `AppIcon`          | `src/runtime/components/app-icon/index.vue`           | 统一图标入口：iconify（本地图标集）与 Element Plus 图标 |
| `EleContainerCard` | `src/runtime/components/ele-container-card/index.vue` | 查询 / 列表 / 表单的卡片外壳                            |
| `EleSearchForm`    | `src/runtime/components/ele-search-form/index.vue`    | 配置驱动的搜索表单                                      |
| `EleTable`         | `src/runtime/components/ele-table/index.vue`          | `ElTable` 薄封装（默认 `fill` 撑满父容器）              |
| `ElePagination`    | `src/runtime/components/ele-pagination/index.vue`     | `ElPagination` 薄封装                                   |

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
Tailwind 扫描入口是包根的 `styles.css`（`@source "./src/runtime/components"`），不要在 `dist/` 里生成它——dev server 运行期间重建 dist 会让入口文件短暂缺失。
