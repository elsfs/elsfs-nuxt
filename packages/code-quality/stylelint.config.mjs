import standard from 'stylelint-config-standard'

/**
 * Nuxt 4 + Tailwind v4 + Vue 项目共享的 Stylelint 配置（stylelint 17 对象形式）。
 *
 * - customSyntax: postcss-html 支持解析 .vue 里的 <style> 块（也兼容纯 CSS）
 * - 在 stylelint-config-standard 基础上放行 Tailwind v4 的自定义 at-rule / function
 * - 选择器 pattern 放宽以兼容 Element Plus 的 BEM 类名（el-input__wrapper）与
 *   Nuxt loading 元素（#__app-loading__）
 * - 关闭与 Tailwind 设计冲突的规则（no-descending-specificity）
 */
export const stylelintConfig = {
  customSyntax: 'postcss-html',
  rules: {
    ...standard.rules,
    // Element Plus BEM 类名（el-input__wrapper）与 Nuxt loading ID（#__app-loading__）
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(?:[_-]{1,2}[a-z0-9]+)*$',
      { resolveNestedSelectors: true },
    ],
    'selector-id-pattern': [
      '^[_-]{0,2}[a-z][a-z0-9]*(?:[_-]{1,2}[a-z0-9]+)*[_-]{0,2}$',
      { resolveNestedSelectors: true },
    ],
    // Tailwind v4 的指令，均为样式源文件中的合法 at-rule
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'apply',
          'config',
          'custom-variant',
          'reference',
          'screen',
          'source',
          'tailwind',
          'theme',
          'utility',
          'variant',
        ],
      },
    ],
    // Tailwind 主题里常用 theme() 取设计令牌
    'function-no-unknown': [true, { ignoreFunctions: ['theme'] }],
    // Tailwind 类名与语义层叠天然有特异性重叠，不视为缺陷
    'no-descending-specificity': null,
  },
}

export default stylelintConfig
