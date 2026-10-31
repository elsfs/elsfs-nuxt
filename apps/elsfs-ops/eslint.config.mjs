// @ts-check
import { createNuxtEslintConfig } from 'code-quality/eslint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
// 共享基线来自 packages/code-quality，playground 一并纳入 src 检查
export default createNuxtEslintConfig({
  dirs: {
    src: ['./playground'],
  },
})
