---
slug: docus
subtitle: ""
title: Docus
baseDir: .starters/default
branch: main
category: docs
createdAt: 2023-11-15T17:41:03.087Z
demo: https://docus.dev
description: 使用 Markdown 编写精美的文档
licenseType: nuxt-ui
mainScreen: /templates/docus.webp
name: docus
owner: nuxt-content
image1: /blog/docus.webp
image2: ""
image3: ""
---

::template-core
> 一个美观、极简的起步模板，用于借助 Docus 创建文档

这是默认的 Docus 起步模板，提供了使用 Markdown 和 Vue 组件构建精美文档站所需的一切。

## ✨ 特性

- 🎨 **精美设计** - 干净、现代的文档主题
- 📱 **响应式** - 移动优先的响应式设计  
- 🌙 **暗色模式** - 内置亮色/暗色模式支持
- 🔍 **搜索** - 全文搜索功能
- 📝 **增强的 Markdown** - 使用自定义组件扩展 Markdown
- 🎨 **可自定义** - 轻松定制主题与品牌
- ⚡ **快速** - 借助 Nuxt 4 优化性能
- 🔧 **TypeScript** - 完整的 TypeScript 支持

## 🚀 快速开始

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

你的文档站将运行在 `http://localhost:3000`

## 📁 项目结构

```text
my-docs/
├── content/              # Your markdown content
│   ├── index.md         # Homepage
│   ├── 1.getting-started/  # Getting started section
│   └── 2.essentials/    # Essential documentation
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## ⚡ 技术栈

该起步模板已预先配置：

- [Nuxt 4](https://nuxt.com) - Web 框架
- [Nuxt Content](https://content.nuxt.com/) - 基于文件的 CMS
- [Nuxt UI](https://ui.nuxt.com) - 优质 UI 组件
- [Nuxt Image](https://image.nuxt.com/) - 图片优化
- [Tailwind CSS 4](https://tailwindcss.com/) - 原子化 CSS
- [Docus Layer](https://www.npmjs.com/package/docus) - 文档主题

## 📖 文档

有关自定义 Docus 项目的详细文档，请访问 [Docus 文档](https://docus.dev)

## 🚀 部署

生产环境构建：

```bash
npm run build
```

构建产物将位于 `.output` 目录中，可直接部署到任何支持 Node.js 的托管服务商。

## 📄 许可证

[MIT 许可证](https://opensource.org/licenses/MIT)

#right
  :::template-features
  ---
  features:
    - label: Nuxt 4
      content: 基于 Nuxt 4 构建，带来最佳性能与 SEO。
    - label: Markdown
      content: 借助 Nuxt Content，使用 MDC 编写页面。
    - label: Nuxt UI
      content: 提供大量完全可自定义的组件。
    - label: TypeScript
      content: 全程类型化的开发体验。
    - label: Nuxt Studio
      content: 支持 Nuxt Studio，可快速更新和预览。
    - label: Search
      content: 由 Fuse.js 驱动的全文搜索弹窗。
  ---
  :::
::
