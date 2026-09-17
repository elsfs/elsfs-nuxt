import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,   // 串行执行测试文件
  },
})
