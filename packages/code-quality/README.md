# code-quality

Nuxt 4 monorepo 共享的代码质量工具链配置（pnpm workspace 包，供 `apps/*` 与 `packages/*` 复用）。

| 工具                                                    | 职责                                                           | 共享配置                            | 各项目接入                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| [ESLint](https://eslint.org)                            | 语义检查（基于 `@nuxt/eslint-config` 的 flat config）          | `code-quality/eslint`               | `eslint.config.mjs`：`import { createNuxtEslintConfig } from 'code-quality/eslint'`        |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)   | 秒级冗余检查（correctness / suspicious / perf）                | `code-quality/oxlint`               | `oxlint.config.ts`：`createNuxtOxlintConfig()`（**不能只写 `extends`**，见下）             |
| [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) | 格式化（引号、分号、import / Tailwind 类 / package.json 排序） | `packages/code-quality/oxfmt.json`  | scripts 里 `oxfmt -c ../../packages/code-quality/oxfmt.json`                               |
| [Stylelint](https://stylelint.io)                       | CSS / Vue `<style>` 样式检查（Tailwind v4 语法放行）           | `code-quality/stylelint`            | `stylelint.config.mjs` 里 `import { stylelintConfig } from 'code-quality/stylelint'`       |
| [CSpell](https://cspell.org)                            | 拼写检查（内置 `.vue` 与中文支持）                             | `packages/code-quality/cspell.json` | `cspell.config.json` 的 **`import`** 字段（cspell 10 起改名，旧的 `imports` 静默失效）引用 |
| [Publint](https://publint.dev)                          | 库包发布元数据检查（仅要发布的包需要）                         | 无配置文件                          | scripts 里加 `lint:package: publint`（`nuxt-request`、`code-quality`）                     |

## 职责划分

- **格式** → Oxfmt（`fmt` / `fmt:check`）；ESLint 侧 `features.stylistic` 默认 `false`，避免 `@stylistic/*` 与 oxfmt 在 `arrow-parens` / `quote-props` / `member-delimiter-style` 等处互相拉扯
- **语义** → ESLint（全量）+ Oxlint（秒级预检，50~100 倍速）
- **样式语义** → Stylelint（只查 CSS/Vue 的 `<style>`，Tailwind v4 指令放行）
- **拼写** → CSpell（共享 `cspell.json`，各包经 `import` 引用）
- **发布质量** → Publint（库包发布前跑，校验 `exports`/`files` 等元数据）
- **类型** → `typecheck`（应用用 `vue-tsc --noEmit`，本包用 `tsc --noEmit`），与 lint 分开、不归本包

## 各项目 scripts 约定

```jsonc
{
  "scripts": {
    "lint": "pnpm lint:eslint && pnpm lint:oxlint && pnpm lint:style && pnpm lint:spell",
    "lint:eslint": "eslint .",
    "lint:oxlint": "oxlint",
    // 应用（admin / content）没有独立样式文件时也用同一行；库包与本包加 --allow-empty-input 以兼容无匹配文件
    "lint:style": "stylelint \"**/*.{css,vue}\"",
    "lint:spell": "cspell lint \"**/*.{ts,vue,js,mjs,cjs,json,jsonc,md,mdx,css,yaml,yml}\"",
    "lint:package": "publint", // 仅要发布的包（nuxt-request、code-quality）
    "fmt": "oxfmt -c ../../packages/code-quality/oxfmt.json",
    "fmt:check": "oxfmt --check -c ../../packages/code-quality/oxfmt.json",
  },
}
```

> `-c` 相对路径按包深度调整：`apps/*` 用 `../../packages/code-quality/...`，`packages/nuxt-request`、`packages/tailwind-config` 用 `../code-quality/...`，本包用 `./oxfmt.json`（共享包自己的 `fmt` 脚本必须显式带 `-c`，否则会退回 oxfmt 默认风格）。

## 关键实现细节（改动前先读）

- **Oxlint 必须用工厂函数**：`extends` 只合并 `rules` / `plugins` / `overrides`，`categories` / `env` / `globals` / `settings` / `ignorePatterns` 都不会继承，所以这里导出 `createNuxtOxlintConfig(options)` 而不是一个纯配置对象
- **Oxlint 的 `ignorePatterns` 相对「入口配置文件」目录解析**：共享工厂里统一写成 `**/...`（如 `**/public/sw.js`），否则匹配不到子包路径；consumer 自己传的 `ignorePatterns` 也不会与共享值合并，工厂已做数组拼接
- **Oxfmt 的 `ignorePatterns` 只能在共享配置所在目录内生效**（且不允许 `..`）：所以忽略规则交给各包自己的 `.gitignore` / `.prettierignore`，`oxfmt.json` 里**不要**写 `ignorePatterns`
- **ESLint 与 oxfmt 的写法对齐**：工厂内已把 `vue/html-self-closing` 的 `html.void` 设为 `always`（oxfmt 会给 `<input />` 之类加自闭合斜杠）；`vue/multi-word-component-names` 关闭（`loadingHide.vue` 这类历史命名）
- **Stylelint 17 的配置必须是对象形式**（顶层含 `rules`）：写成数组会报 `No rules found within configuration`（退出码 78）；解析 Vue 的 `<style>` 依赖 `customSyntax: 'postcss-html'`
- **CSpell 10 用 `import` 字段**：改完可用 `cspell trace <word>` 确认词典来源
- **本包的 `.ts` / `.mjs` 会被 `apps/elsfs-admin` 的 `vue-tsc` 检查**（Nuxt layer 机制把 `packages/` 纳入 include）：改完共享配置务必跑一次 admin 的 `pnpm typecheck`，本包自身也配了 `tsc --noEmit`（`types/stylelint-config-standard.d.ts` 用于补 `stylelint-config-standard` 缺失的类型）

## 常见操作

- **新增全局词**：全仓通用的加进 `cspell.json` 的 `words`；单包特有的加进该包 `cspell.config.json` 的 `words`
- **放行 Tailwind 新指令**：在 `stylelint.config.mjs` 的 `at-rule-no-unknown.ignoreAtRules` 追加
- **某包要关闭某条 Oxlint 规则**：在该包 `oxlint.config.ts` 里 `createNuxtOxlintConfig({ rules: { 'xxx': 'off' } })` 覆盖，别改共享配置
- **某包要加 ESLint 专属规则**：在该包 `eslint.config.mjs` 里 `createNuxtEslintConfig({ append: [ { rules: { ... } } ] })`

## 依赖

工具统一走 `pnpm-workspace.yaml` 的 `catalog:`（oxlint / oxfmt / stylelint / stylelint-config-standard / postcss-html / cspell / publint / @nuxt/eslint-config），升级改 catalog 即可全仓生效。
