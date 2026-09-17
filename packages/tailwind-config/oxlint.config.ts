import { createNuxtOxlintConfig } from 'code-quality/oxlint'

// 共享基线来自 packages/code-quality；项目级规则覆盖通过参数传入
// 例：createNuxtOxlintConfig({ rules: { 'no-console': 'off' } })
export default createNuxtOxlintConfig()
