// @ts-check
import { createNuxtEslintConfig } from 'code-quality/eslint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
// 共享基线来自 packages/code-quality，playground 一并纳入 src 检查
export default createNuxtEslintConfig({
  dirs: {
    src: ['./playground'],
  },
  append: [
    {
      // 该模块是通用请求库：`<T = any>` 泛型默认值与深层取值工具函数是刻意的设计，
      // 存量代码量较大，先降级为 warning，后续再逐步收敛为具体类型
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
})
