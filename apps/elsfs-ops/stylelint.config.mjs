import { stylelintConfig } from 'code-quality/stylelint'

export default {
  ...stylelintConfig,
  // 构建产物 / 依赖目录里的生成文件不参与样式检查
  ignoreFiles: ['dist/**', '.nuxt/**', '.output/**', 'node_modules/**'],
}
