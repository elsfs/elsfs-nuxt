import { defineConfig, type OxlintConfig } from 'oxlint'

/**
 * Nuxt 4 项目共享的 Oxlint 基线（仅含可被 `extends` 继承的字段）。
 *
 * oxlint 的 `extends` 只合并 `rules` / `plugins` / `overrides` 三项，
 * `categories` / `env` / `globals` / `settings` / `ignorePatterns` 都不会继承，
 * 因此各项目请使用下面的 `createNuxtOxlintConfig()` 工厂，而不是只写 `extends`。
 */
export const oxlintBase: OxlintConfig = {
  plugins: ['import', 'typescript', 'unicorn'],
  rules: {
    // Nuxt 全局自动导入（useState、definePageMeta、$fetch 等）由 @nuxt/eslint / vue-tsc 负责，
    // oxlint 无法识别完整的 Nuxt 运行时全局，避免误报
    'no-undef': 'off',
  },
}

/**
 * 生成 Nuxt 4 项目的 Oxlint 配置。
 *
 * ```ts
 * // oxlint.config.ts
 * import { createNuxtOxlintConfig } from 'code-quality/oxlint'
 * export default createNuxtOxlintConfig()
 * ```
 *
 * @param options 项目级覆盖，优先级高于共享基线
 */
export function createNuxtOxlintConfig(options: OxlintConfig = {}): OxlintConfig {
  return defineConfig({
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      perf: 'warn',
      ...options.categories,
    },
    env: {
      browser: true,
      node: true,
      es2026: true,
      vue: true,
      ...options.env,
    },
    plugins: options.plugins ?? oxlintBase.plugins,
    rules: {
      ...oxlintBase.rules,
      ...options.rules,
    },
    // 注意：ignorePatterns 相对「入口配置文件」所在目录解析；
    // 这里统一用 `**/` 前缀，保证在各子包目录下也能匹配到
    ignorePatterns: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/.data/**',
      '**/.nitro/**',
      '**/dist/**',
      '**/.playground/.nuxt/**',
      // 占位的空 Service Worker，只有一行注释，不必按「空文件」报错
      '**/public/sw.js',
      '**/public/sw.ts',
      ...(options.ignorePatterns ?? []),
    ],
  })
}

export default createNuxtOxlintConfig()
