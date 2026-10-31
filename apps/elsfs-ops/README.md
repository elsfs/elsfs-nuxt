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

新增页面只要加 `<分组>/<页面>/index.vue`（dev 下会自动重启并刷新路由，无需改模块代码；生产构建前重建 `dist/`）。

## 使用

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['elsfs-ops'],
})
```

```css
/* assets/css/main.css */
@import 'tailwindcss';
/* 把模块页面目录登记为 Tailwind source，页面里独有的工具类才会生成 */
@import 'elsfs-ops/styles.css';
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

源码在 `src/`：`src/module.ts` 负责扫描/注册页面，`src/runtime/pages/**` 会原样构建到 `dist/runtime/pages/**`，dev 下新增 / 删除页面目录会自动重启 dev server 重新扫描路由（页面文件本身的改动只走 HMR）。Tailwind 扫描入口是包根的 `styles.css`（`@source "./src/runtime/pages"`），放包根而不是 `dist/`，dev 期间重建 dist 不会导致入口文件短暂缺失。

`elsfs-admin` 的 `nuxt dev` 会按 `src/module.ts` 直接加载本模块源码，改页面即时生效，不需要先 `pnpm postinstall`；但 `nuxt build` 和 `pnpm typecheck` 仍走 `dist/`，构建前要重建。

页面模板里用到应用 `app/utils/system-options` 的自动导入项（`STATUS_OPTIONS`、`sexText`、`menuTypeText` 等）时，要在页面里显式 `import { ... } from '~/utils/system-options'`：自动导入只在运行时由 Nuxt 注入，`vue-tsc` 检查模板时不会把自动导入当成全局变量（否则报 `Property 'xxx' does not exist`）。

### IDE 类型提示

包根的 `nuxt.config.ts` **不参与运行**，只给 `nuxt-module-build prepare`（`postinstall` 里会跑）生成模块自己的 `.nuxt` 类型用：它额外挂了 `elsfs-components` 与 `@element-plus/nuxt`，所以 IDE 里编辑 `src/runtime/pages/**` 时，模板里的 `<EleTable>` / `<EleSearchForm>` / `<ElInput>` 等能拿到自动导入组件的类型提示（`@element-plus/nuxt` 只是 devDependency，不会被发布）。删掉这份配置运行时不受影响，但 IDE 会失去组件提示。

> 宿主应用独有的东西（`useApi`、`usePagedList`、`ElMessage`、`~/utils/*` 别名）在模块包自己的类型环境里解析不到，模块包内看到这些红波浪属预期；由 `elsfs-admin` 的 `pnpm typecheck` 负责最终校验。
