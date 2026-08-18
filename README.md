# elsfs-nuxt

基于 [Nuxt](https://nuxt.com) 与 [Nuxt UI](https://ui.nuxt.com) 的应用。

## 技术栈

- [Nuxt 4](https://nuxt.com)
- [Nuxt UI v4](https://ui.nuxt.com)（Tailwind CSS v4）
- [Pinia](https://pinia.vuejs.org)（状态管理，通过 `@pinia/nuxt`）
- [Module Federation](https://module-federation.io)（通过 `@module-federation/nuxt`，作为 remote 应用）

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:3000）
pnpm dev

# 类型检查
pnpm typecheck

# Lint
pnpm lint

# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

## 目录结构

```
app.vue              应用入口
assets/css/          Tailwind / Nuxt UI 样式
components/          通用组件
layouts/             布局（default / orange）
middleware/          路由中间件（auth）
pages/               页面
server/              Nitro 服务端插件
stores/              Pinia stores
```
