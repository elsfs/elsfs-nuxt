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

模块页面依赖宿主应用（`elsfs-admin`）的别名、自动导入与 `admin` 布局，所以包根的 `nuxt.config.ts` / `tsconfig.json` 专门做了**只给 IDE（Volar）用**的接线（都不参与运行、也不进发布产物）：

- `nuxt.config.ts`：`postinstall` / `dev:prepare` 里用普通 `nuxt prepare`（不是 `nuxt-module-build prepare`）生成模块自己的 `.nuxt`，配置里挂了 `./src/module` + `elsfs-components` + `@element-plus/nuxt`，把 `~` / `@` 指向 `../elsfs-admin/app`，并把 admin 的 `app/composables`、`app/utils` 加进 `imports.dirs` → 于是 `useApi`、`usePagedList`、`ElMessage`、`onMounted`、`~/utils/*`、`<EleTable>` 等全部有类型
- `tsconfig.json`：用 `"files": ["../elsfs-admin/app/types/nuxt.d.ts"]` 引入 `$api` / `$authToken` 的模块增强（`useApi` 的返回类型依赖它）
- 改完宿主的 `app/composables` / `app/utils`（新增自动导入）后，在 `apps/elsfs-ops` 重跑一次 `pnpm postinstall`（或 `npx nuxt prepare`），再在 VS Code 执行 `Vue: Restart Vue language server`，提示才会更新
- `@element-plus/nuxt` 只是 devDependency，不会被发布
