import { createNuxtOxlintConfig } from 'code-quality/oxlint'

// 共享基线来自 packages/code-quality；项目级规则覆盖通过参数传入
export default createNuxtOxlintConfig({
  rules: {
    // nuxt.config.ts 需要把 `_redirects` 解析结果展开合并进 routeRules，
    // unicorn 的这条规则在此场景属误报
    'unicorn/no-useless-spread': 'off',
  },
})
