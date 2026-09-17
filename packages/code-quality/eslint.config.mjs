// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export { createConfigForNuxt }

/** @typedef {import('@nuxt/eslint-config/flat').NuxtESLintConfigOptions} NuxtESLintConfigOptions */

/**
 * Nuxt 4 项目共享的 ESLint flat config 工厂。
 *
 * 职责划分：ESLint 只负责语义规则；格式细节（引号、分号、缩进、箭头函数括号、import 排序等）
 * 全部交给 oxfmt，因此这里默认不启用 @nuxt/eslint-config 的 `stylistic` 特性，
 * 否则两套工具会在 arrow-parens / quote-props / member-delimiter-style 等处互相打架。
 *
 * 使用方式见各项目入口：`import { createNuxtEslintConfig } from 'code-quality/eslint'`。
 *
 * @param {NuxtESLintConfigOptions & { append?: object[] }} [options]
 * @returns {ReturnType<typeof createConfigForNuxt>} Nuxt flat config 数组（带 append 方法）
 */
export function createNuxtEslintConfig(options = {}) {
  return createConfigForNuxt({
    features: {
      tooling: options.features?.tooling ?? true,
      stylistic: options.features?.stylistic ?? false,
      ...options.features,
    },
    dirs: options.dirs,
  }).append(
    {
      ignores: [
        '**/.nuxt/**',
        '**/.output/**',
        '**/.data/**',
        '**/.nitro/**',
        '**/dist/**',
        '.playground/.nuxt/**',
        '.playground/.output/**',
      ],
      rules: {
        // Nuxt 约定俗成的组件/文件命名（如 loadingHide.vue）不强制多词
        'vue/multi-word-component-names': 'off',
        // oxfmt 会给 HTML void 元素（input / img / br 等）加自闭合斜杠，
        // 这里与 oxfmt 对齐，避免 `eslint --fix` 与 `fmt` 来回拉扯
        'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
      },
    },
    ...(options.append ?? []),
  )
}

export default createNuxtEslintConfig()
