// @ts-check
import { createNuxtEslintConfig } from 'code-quality/eslint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
// 共享基线来自 packages/code-quality，规则调整优先改共享包，再在这里按需覆盖
export default createNuxtEslintConfig()
