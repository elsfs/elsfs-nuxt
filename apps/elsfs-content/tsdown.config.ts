import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: {
    eager: true,  // 添加这个
  },
})
