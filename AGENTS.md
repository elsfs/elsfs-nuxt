# AGENTS.md

## 项目概况

Nuxt 4 + Nuxt UI v4（Tailwind v4）+ Pinia + @nuxtjs/i18n + vee-validate/yup 的应用，同时作为 Module Federation 的 remote 应用。无后端、无数据库、无测试框架；验证手段是 `lint` + `typecheck` + `build`。

## 命令（包管理器必须是 pnpm）

- `pnpm dev` 开发服务器（localhost:3000）
- `pnpm lint`（eslint flat config，`.vscode` 已开启 flat config）
- `pnpm typecheck`（`vue-tsc --noEmit`）。`tsconfig.json` 继承 `.nuxt/tsconfig.json`，该文件由 `postinstall`（`nuxt prepare`）生成，类型检查前需先 `pnpm install` 或重跑 prepare
- `pnpm build` / `pnpm preview`
- `.npmrc` 含 `legacy-peer-deps=true` 与项目本地 pnpm store

## 目录结构（Nuxt 4）

- srcDir 是 `app/`：页面、布局、组件、middleware、stores、composables 全部在 `app/` 下
- `server/` 为 Nitro 服务端（API、middleware、plugins）；`i18n/` 在项目根
- 注意两个真实存在的拼写错误路径，找不到时别奇怪：`server/utiks/`（非 utils）、`app/pages/datshboard.vue`（非 dashboard）
- 页面守卫通过 `definePageMeta({ middleware: 'auth' | 'guest' })` 使用 `app/middleware/` 下的中间件

## i18n 易踩坑

- locale 文件必须在项目根 `i18n/locales/`（`langDir` 相对 rootDir 解析，放在 `app/` 下不会被加载）
- 语言包按需懒加载：切换语言必须用 `setLocale()`，直接给 `locale.value` 赋值不会加载语言包，`t()` 会回退显示 key
- vue-i18n v11 的 `tm()` 返回编译后 AST，数组消息需按索引翻译，如 `t('common.features.0')`
- 新增任何 key 必须同时更新 `i18n/locales/zh-CN.json` 和 `en.json`（defaultLocale 为 zh-CN，strategy: no_prefix）

## 认证（纯 mock）

- 任意非空凭证即登录成功，无真实校验；token 格式 `mock.<base64url(email)>.<随机串>`，见 `server/api/auth/_mock.ts`
- token 通过 cookie `elsfs_token` 持久化（SSR 安全，7 天）
- 错误约定：服务端 `createError({ message })` 的 `message` 即错误码（如 `VALIDATION_ERROR`、`UNAUTHORIZED`）；store 记录 `errorCode`，UI 用 `t('errors.<code>')` 翻译——新增错误码需同步补 i18n key

## 表单校验

- vee-validate + yup，Schema 集中在 `app/composables/useAuthValidation.ts`
- 校验消息一律用函数形式在「校验发生时」才调用 `t()`（延迟翻译，语言切换即时生效），不要在定义时取字符串

## 其他

- CI（`.github/workflows/ci.yml`）：Node 24.19.0 + corepack + `npx nypm i`，分别跑 lint、typecheck、build
- 提交信息用 Conventional Commits + 中文描述，如 `feat(auth): 添加完整的认证功能模块`
- Module Federation：本应用是 remote（`name: 'remote'`，`hostInitInjectLocation: 'entry'`），改动该配置会影响 host 初始化注入
- 图标用 `i-lucide-*`（`icon.clientBundle.scan: true`，SSR 下避免运行时按需拉取）