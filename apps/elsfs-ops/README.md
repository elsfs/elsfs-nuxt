# elsfs-ops

`elsfs-admin` 的系统管理页面模块：把「用户 / 角色 / 菜单 / 部门 / 职位」这些系统管理页面从应用里拆出来，通过 Nuxt 模块注册到使用方应用的路由。

## 页面

页面放在 `src/runtime/pages/<分组>/<页面>/index.vue`，模块启动时扫描两层目录并注册路由：

| 文件                                         | 路由              |
| -------------------------------------------- | ----------------- |
| `src/runtime/pages/system/user/index.vue`    | `/system/user`    |
| `src/runtime/pages/system/role/index.vue`    | `/system/role`    |
| `src/runtime/pages/system/menu/index.vue`    | `/system/menu`    |
| `src/runtime/pages/system/dept/index.vue`    | `/system/dept`    |
| `src/runtime/pages/system/SysPost/index.vue` | `/system/SysPost` |

新增页面只要加 `<分组>/<页面>/index.vue`（构建 `dist/` 后生效，无需改模块代码）。

## 使用

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['elsfs-ops'],
})
```

模块默认注册页面；只想加载模块、不要这些路由时，可传 `elsfsOps: { pages: false }`。

使用方应用需要提供这些运行时依赖（模块页面按应用内页面编译）：

- `@element-plus/nuxt`（Element Plus 组件自动导入）与 `element-plus`
- `~/utils/api-error`（`toErrorMessage`）、`~/composables/useApi`、`~/composables/usePagedList`
- `app/utils/system-options` 里的自动导入项（`STATUS_OPTIONS`、`statusText` 等）
- `elsfs-components` 模块（页面用 `EleTable` / `EleSearchForm` / `ElePagination` / `EleContainerCard`）
- 布局 `admin`（页面 `definePageMeta({ layout: 'admin' })`）

`vue` / `element-plus` 是 peer 依赖；模块会把它们加入 Vite `resolve.dedupe`，避免出现第二份实例。

## 开发

```bash
pnpm dev          # 构建 stub 并启动 playground
pnpm dev:prepare  # 只生成 stub / 类型
pnpm prepack      # 构建 dist（postinstall 也会自动构建）
pnpm lint
pnpm fmt
```

源码在 `src/`：`src/module.ts` 负责扫描/注册页面，`src/runtime/pages/**` 会原样构建到 `dist/runtime/pages/**`。
