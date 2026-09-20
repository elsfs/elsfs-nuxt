import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // `nuxt-module-build` 默认只把 `src/module` 与 `src/runtime/` 打包进 dist，
  // `src/api`（对外通过 `api-types/<path>` 深路径消费的接口类型）不在默认范围内，
  // 因此显式补一条构建条目，把 `src/api/**` 转译到 `dist/api/**`
  // （与 `module.ts` 里 `addImportsDir(resolver.resolve('./api'))` 的目标一致）。
  entries: [
    {
      input: 'src/api/',
      outDir: 'dist/api',
      ext: 'js',
      addRelativeDeclarationExtensions: true,
      pattern: [
        '**',
        '!**/*.stories.{js,cts,mts,ts,jsx,tsx}',
        '!**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      ],
    },
  ],
})
