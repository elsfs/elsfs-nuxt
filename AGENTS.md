# AGENTS.md

## 项目概况

pnpm workspace 单仓多包。**根目录 `package.json` 是空容器**（`scripts: {}`、无依赖），任何命令都要进到具体包里跑。

| 包 | 路径 | 说明 |
| --- | --- | --- |
| `elsfs-nuxt` | `apps/elsfs-admin` | 唯一的 Nuxt 4 应用（目录名与包名不一致，注意 filter 用包名） |
| `tailwind-config` | `packages/tailwind-config` | Nuxt Layer，被应用以 `extends: ['tailwind-config']` 复用 |

应用技术栈：Nuxt 4.5 + Vue 3.5 + Pinia + Element Plus 2.14（`@element-plus/nuxt`）+ `@nuxtjs/i18n` v10 + `@nuxtjs/color-mode` + vee-validate 5 + zod 4 + Tailwind v4（CSS-first，配置在 layer）。

没有后端服务、没有数据库、没有测试框架；验证手段只有 `lint` + `typecheck` + `build`。

> 仓库里留着改版前的产物/占位，别被误导：根 `i18n/` 是空目录、根 `.nuxt`/`.output` 是旧构建残留、根 `package.json` 无脚本、`README.md` 仍是旧的单应用描述（写的是 Nuxt UI + Module Federation，都已不存在）、根 `package.json` 的 `pnpm.overrides` 里还挂着 `@module-federation/vite`（无人使用）。

## 命令（包管理器必须是 pnpm）

在 `apps/elsfs-admin/` 下执行：

- `pnpm dev` 开发服务器（localhost:3000）
- `pnpm lint`（`eslint .`，flat config 在 `apps/elsfs-admin/eslint.config.mjs`，`.vscode` 已开启 `eslint.useFlatConfig`）
- `pnpm typecheck`（`vue-tsc --noEmit`）
- `pnpm build` / `pnpm preview` / `pnpm generate`

从仓库根执行等价命令：`pnpm --filter elsfs-nuxt <script>`。

layer 自带 playground，可脱离应用单独调试样式：在 `packages/tailwind-config/` 下 `pnpm dev`（跑的是 `.playground`）。

坑：

- `apps/elsfs-admin/tsconfig.json` 只继承 `./.nuxt/tsconfig.json`，该文件由 `postinstall`（`nuxt prepare`）生成；类型检查报「找不到类型」时先 `pnpm install` 或重跑 `nuxt prepare`
- lint 输出管道给 `tail`/`head` 会吞掉 ESLint 的退出码（拿到的是管道最后一条命令的状态）；要判断成败就别接管道
- 仓库没有 turbo/nx 之类的任务编排器，根目录没有聚合的 `lint`/`typecheck`/`build`
- 根 `.npmrc`：`legacy-peer-deps=true`、项目本地 store `.pnpm-store`；`packages/tailwind-config/.npmrc` 另有一份（`shamefully-hoist=true`、`strict-peer-dependencies=false`；后者的键名在当前 pnpm 版本已不生效）

## 依赖版本管理

- 公共依赖版本集中在 `pnpm-workspace.yaml` 的 `catalog:` 段（vue、nuxt、eslint、typescript、vee-validate、zod、tailwind 相关等），包内写 `"xxx": "catalog:"`
- 升级公共依赖优先改 catalog，别在各包内散写版本号
- 例外：应用里 element-plus、`@element-plus/icons-vue`、tailwindcss、nuxt 等仍写显式版本（未进 catalog），改版本时留意两处不一致

## 目录结构（Nuxt 4，srcDir 为 `app/`）

应用 `apps/elsfs-admin/`：

- `app/`：`pages/`、`layouts/`、`components/`、`composables/`、`middleware/`、`stores/`、`plugins/`、`utils/`、`assets/css/`、`app.config.ts`、`app.vue`
- `server/`：Nitro 服务端，`api/`、`middleware/`、`plugins/`、`utiks/`、`tsconfig.json`
- 其余：`i18n/locales/`（语言包）、`public/`、`nuxt.config.ts`、`eslint.config.mjs`

Layer `packages/tailwind-config/`：入口是 `nuxt.config.ts`（`package.json` 的 `main` 指向它），样式在 `src/assets/theme.css`，`app.config.ts` 暴露 `elsfsComponents`，`.playground/` 仅用于调试。

真实存在的拼写/命名错误路径，找不到时别奇怪：

- `server/utiks/`（非 `utils`；目前只有 `constants.ts`，含 Hacker News API base）
- `app/pages/datshboard.vue`（非 `dashboard`）
- `app/components/loadingHide.vue`（非 PascalCase，组件名仍是 `LoadingHide`）

## 路由、布局与守卫

现有页面：`/`(index)、`/login`、`/register`、`/code-login`、`/qrcode-login`、`/forget-password`、`/datshboard`、`/about`、`/posts/[id]`。

- 认证类页面统一用 `definePageMeta({ layout: 'auth', middleware: 'guest' })`；受保护页面用 `middleware: 'auth'`
- `app/middleware/auth.ts`：未登录跳 `/login?redirect=<原地址>`；`guest.ts`：已登录访问登录/注册页时跳回 `redirect` 或 `/`
- 三个布局：`auth`（认证页双栏外壳，支持左/中/右三种面板形态与明暗切换）、`default`（占位）、`orange`（演示用，`/about` 使用）
- `auth` 布局把表单包在 `AuthenticationFormView` 里，并全局覆盖 `.auth-form` 下的 Element Plus 输入框/按钮样式
- `app/plugins/loading.client.ts` 负责首屏 loading（`#__app-loading__`）的隐藏与兜底移除，配合 `LoadingHide` 组件
- `app.vue` 显式 `import LoadingHide from '~/components/loadingHide.vue'`，别删这行或改成自动导入

### 组件

- `app/components/auth/` 下的文件自动导入后是 PascalCase：`code-login.vue` → `AuthCodeLogin`，`login.vue` → `AuthLogin`，`third-party-login.vue` → `AuthThirdPartyLogin`，以此类推
- `app/components/authentication-form-view.vue` → `AuthenticationFormView`
- 页面过渡在 `nuxt.config.ts` 里配置（`pageTransition: { name: 'page', mode: 'out-in' }`，`experimental.viewTransition: true`），`/about` 单独用 `layoutTransition`

## 样式（Tailwind v4）

- 全 CSS-first：没有 `tailwind.config.js`，主题在 layer 的 `src/assets/theme.css`（`@theme` / `@theme inline` / `@custom-variant`）
- 两份 CSS 入口都要注意：应用侧 `assets/css/main.css` 与 `assets/css/tokens.css`（在 `nuxt.config.ts` 的 `css` 里按序加载），layer 侧 `src/assets/theme.css` 由 layer 的 `nuxt.config.ts` 注入
- `theme.css` 顶部先声明级联层顺序 `@layer properties, theme, base, ant, antd, el, td, components, utilities;`（`el` 层是给 Element Plus 预留的位置，工具类排在最后才能覆盖组件库样式）；改动层顺序会静默影响覆盖效果
- **不要跨文件重复 `@import 'tailwindcss'`**：`main.css` 已导入，layer 也导入；重复引入会产生多份 preflight/层声明
- Tailwind 不自动扫描 node_modules，monorepo 类名靠 layer 里 `@source '../../../packages/'`、`@source '../../../apps/'` 显式声明；**`@source` 的相对路径以编译时的 base（应用 rootDir）为基准**，不是以 CSS 文件所在目录为基准
- 语义色走 HSL 通道变量：layer 把 `bg-background`/`text-foreground`/`text-primary` 等映射为 `hsl(var(--background))` 形式，**上游通道值由应用的 `assets/css/tokens.css` 提供**（`:root` 亮色、`:root.dark` 暗色）；新增语义色要两边同时补
- 暗色是 class 变体，layer 里写死为 `@custom-variant dark (&:is(.dark *))`：它只匹配 `.dark` 的**后代**，因此 `.dark` 必须加在祖先元素上（color-mode 默认加在 `<html>`）；谁把变体改成 `&:is(.dark)`，暗色工具类就会失效。切换用 `@nuxtjs/color-mode` 的 `useColorMode()`（应用未覆盖模块默认配置）；`tokens.css` 的暗色令牌选择器是 `:root.dark`，二者是配套的两件事

### 图标（容易踩）

- 应用装了 `@iconify-json/lucide`，layer 装了 `@iconify-json/mdi`，插件 `@iconify/tailwind4` 由 layer 提供
- 统一用 `app/components/AppIcon.vue`：既能渲染 iconify（渲染 `<i class="icon-[...]">`），也能渲染 Element Plus 图标（按 PascalCase 查 `@element-plus/icons-vue`）
- **图标类名必须能被 Tailwind 扫到**：要么在使用处写完整字面类名 `icon-[lucide--shield-check]`，要么先在 `AppIcon.vue` 的 `ICONIFY_CLASSES` 登记表里加一行。运行时字符串拼接出来的类名扫描不到，图标会直接不显示——新增图标最常见的坑
- 旧写法 `i-lucide-shield-check` 仍可用（内部正则转换），新代码优先 `icon-[lucide--shield-check]`
- 用 Element Plus 图标时传短名（如 `name="medal"`、`name="circle-check"`，大小写不敏感），不要写 `ElIconXxx`

## i18n 易踩坑

- 配置在 `apps/elsfs-admin/nuxt.config.ts` 的 `i18n` 段：`defaultLocale: 'zh-CN'`、`strategy: 'no_prefix'`、`langDir: 'locales'`、浏览器语言检测用 cookie `i18n_redirected`
- 语言包实际位置是 `apps/elsfs-admin/i18n/locales/{zh-CN,en}.json`。`@nuxtjs/i18n` v10 的 `restructureDir` 默认为 `'i18n'`，`langDir` 相对 `<rootDir>/<restructureDir>` 解析，所以这个组合是对的；**`langDir` 不是相对 rootDir**，理解错就会把文件放到 v10 不认的位置
- 语言包按需懒加载：切换语言必须用 `setLocale()`，直接给 `locale.value` 赋值不会加载语言包，`t()` 会回退显示 key
- vue-i18n v11 的 `tm()` 返回编译后 AST，数组消息需按索引翻译，如 `t('common.features.0')`（`common.features` 就是数组）
- 新增任何 key 必须同时更新 `zh-CN.json` 与 `en.json`；两文件当前 key 完全对齐，别破坏这一点
- 消息里的字面 `@` 要转义成 `you{'@'}example.com`，否则 vue-i18n 会当成 linked message 语法

## 认证（纯 mock）

- 任意非空凭证即登录成功，无真实校验；token 格式 `mock.<base64url(email)>.<随机串>`，工具在 `server/api/auth/_mock.ts`
- token 通过 cookie `elsfs_token` 持久化（`useCookie`，SSR 安全，7 天，`sameSite: 'lax'`），刷新后由 `/api/auth/me` 恢复用户
- 错误约定：服务端 `createError({ statusCode, statusMessage, message })` 的 `message` 即错误码；store 落到 `errorCode`，UI 用 `t('errors.<code>')` 翻译
- 实际抛出的错误码只有 `VALIDATION_ERROR`（422）与 `UNAUTHORIZED`（401）；`errors` 里的 `INVALID_CREDENTIALS`、`EMAIL_TAKEN` 目前没有任何端点在用，`NETWORK_ERROR` 是前端 catch 的兜底值
- 状态机 `idle -> loading -> success | error`，全部集中在 `app/stores/auth.ts`（含 `login`/`register`/`codeLogin`/`sendCode`/`forgetPassword`/`socialLogin`/`fetchUser`/`logout`/`reset`）
- 验证码登录复用 `/api/auth/login`，验证码固定 `123456` 且只在 UI 提示，服务端不做校验；社交登录也不校验 provider
- `server/middleware/auth.ts` 目前只是往 `event.context.auth` 塞了个假对象，没有真正鉴权

## 表单校验

- vee-validate + **zod**，Schema 工厂集中在 `app/composables/useAuthValidation.ts`：`createLoginSchema` / `createRegisterSchema` / `createCodeLoginSchema` / `createForgetPasswordSchema`，经 `useAuthValidation()` 绑定当前 i18n 实例
- **该文件头部注释仍写「yup」，是过时注释，以代码为准**
- zod 的校验消息必须传对象（`z.string().min(1, { message: t('validation.required') })`），不是字符串位置参数
- 消息在 Schema 创建时就调用 `t()`，所以换语言后要重新创建 Schema 才会刷新消息

## 常见改动怎么做

- 新增受保护页面：建 `app/pages/xxx.vue`，加 `definePageMeta({ middleware: 'auth' })`，文案同时补两个语言包
- 新增错误码：先在 `server/` 用 `createError({ message: 'XXX' })` 抛出，再到 `i18n/locales/{zh-CN,en}.json` 的 `errors` 下补 key，否则 UI 只能显示 key
- 新增认证表单：在 `useAuthValidation.ts` 加 zod 工厂 → 页面用 vee-validate 的 `toTypedSchema` 接上 → 文案补双语言
- 新增 iconify 图标：优先直接在模板写 `icon-[lucide--xxx]`；要按名传参就登记进 `AppIcon.vue` 的 `ICONIFY_CLASSES`
- 新增组件：放 `app/components/auth/` 会得到 `AuthXxx` 名字（自动导入），公用组件放 `app/components/` 根

## 其他约定与待修项

- CI（`.github/workflows/ci.yml`）：Node 24.19.0 + `corepack enable` + `npx nypm@latest i`，两个 job 分别跑 `npm run lint`/`npm run typecheck` 与 `npm run build`。**但它在仓库根目录执行 `npm run`，而根 `package.json` 没有 scripts，这条流水线在当前结构下必然失败**——属于已知待修项，别把它当作可用验证手段
- 提交信息用 Conventional Commits + 中文描述，如 `feat(auth): 添加完整的认证功能模块`
- 没有测试框架、没有 husky/lint-staged；提交前手动跑 lint + typecheck
- Element Plus 通过 `@element-plus/nuxt` 自动引入组件与样式，不要在业务代码里手写 `import { ElButton } from 'element-plus'`
- 现阶段 `pnpm lint` 并非全绿（`loadingHide.vue`、`nuxt.config.ts` 有格式错误，`app/middleware/auth.ts` 等工作区改动也会报），修完再提交
