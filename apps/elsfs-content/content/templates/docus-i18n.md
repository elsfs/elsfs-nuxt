---
slug: docus-i18n
subtitle: ""
title: Docus I18n
baseDir: .starters/i18n
branch: main
category: docs
createdAt: 2023-11-15T17:41:03.087Z
demo: https://docus.dev
description: 使用 Markdown 和 Nuxt I18n 编写美观的国际化文档
licenseType: nuxt-ui
mainScreen: /templates/docus.webp
name: docus
owner: nuxt-content
image1: /blog/docus.webp
image2: ""
image3: ""
draft: true
---

::template-core
> 一个美观、支持国际化的起步模板，用于借助 Docus 创建多语言文档

这是 i18n 版 Docus 起步模板，提供了使用 Markdown 和 Vue 组件构建美观的多语言文档站所需的一切。

## ✨ 特性

- 🌍 **国际化** - 为多语言文档提供原生 i18n 支持
- 🎨 **精美设计** - 干净、现代的文档主题
- 📱 **响应式** - 移动优先的响应式设计  
- 🌙 **暗色模式** - 内置亮色/暗色模式支持
- 🔍 **搜索** - 按语言提供全文搜索功能
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

你的多语言文档站将运行在 `http://localhost:3000`

## 🌍 语言

该起步模板已预先配置：

- 🇺🇸 **English** (`en`) - 默认语言
- 🇫🇷 **Français** (`fr`) - 法语翻译

## 📁 项目结构

```text
my-docs/
├── content/              # Your markdown content
│   ├── en/              # English content
│   │   ├── index.md     # English homepage
│   │   └── docs/        # English documentation
│   └── fr/              # French content
│       ├── index.md     # French homepage
│       └── docs/        # French documentation
├── public/              # Static assets
├── nuxt.config.ts       # Nuxt configuration with i18n setup
└── package.json         # Dependencies and scripts
```

### 内容结构

内容按语言组织，便于管理翻译：

```text
content/
├── en/                   # English content
│   ├── index.md
│   ├── 1.getting-started/
│   │   ├── installation.md
│   │   └── configuration.md
│   └── 2.essentials/
│       ├── markdown.md
│       └── components.md
└── fr/                   # French content
    ├── index.md
    ├── 1.getting-started/
    │   ├── installation.md
    │   └── configuration.md
    └── 2.essentials/
        ├── markdown.md
        └── components.md
```

## 🔗 URL 结构

i18n 起步模板会生成带语言前缀的 URL：

- 英语：`/en/getting-started/installation`
- 法语：`/fr/getting-started/installation`
- 默认语言回退：`/getting-started/installation`（重定向到英语）

## ⚡ 技术栈

该起步模板已预先配置：

- [Nuxt 4](https://nuxt.com) - Web 框架
- [Nuxt Content](https://content.nuxt.com/) - 基于文件的 CMS
- [Nuxt i18n](https://i18n.nuxt.com/) - 国际化
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
      content: Web 框架
    - label: Nuxt I18n
      content: 国际化支持。
    - label: Nuxt UI
      content: 提供大量完全可自定义的组件。
    - label: TypeScript
      content: 全程类型化的开发体验。
    - label: Nuxt Studio
      content: 支持 Nuxt Studio，可快速更新和预览。
    - label: Search
      content: 由 Fuse.js 驱动的全文搜索弹窗。
    - label: Nuxt Image
      content: 强大的图片组件。
    - label: Nuxt Content
      content: 强大的内容组件。
  ---
  :::
::
