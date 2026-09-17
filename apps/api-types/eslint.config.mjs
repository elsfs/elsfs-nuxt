// @ts-check
import { createNuxtEslintConfig } from 'code-quality/eslint'

// api-types（Nuxt 模块）复用共享代码质量基线；playground 一并纳入 src 检查
// 格式交给 oxfmt，共享工厂已关闭 stylistic，避免两套工具互相拉扯
export default createNuxtEslintConfig({
  dirs: {
    src: ['./playground'],
  },
  append: [
    {
      // 该包是后端接口类型集合：`any` 泛型默认值、以及用 namespace 归类同一领域的
      // 接口与函数是刻意的组织方式，先降级为 warning，后续再逐步收敛为具体类型
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-namespace': 'warn',
      },
    },
  ],
})
