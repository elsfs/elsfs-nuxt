---
name: Visual front-matter edition
title: 可视化 frontmatter 编辑
description: 现在，你可以通过可视化界面而非 YAML 来编辑页面元数据。
date: 2024-10-17T00:00:00.000Z
image:
  src: /blog/frontmatters.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
category: studio
---

::warning
本文发布于 2025 年 1 月 6 日 [Content](https://github.com/nuxt/content) 与 [Studio](https://github.com/nuxtlabs/studio-module) 模块合并之前，因此内容可能存在一些不一致之处。Studio 模块现已废弃，改为 Content 模块的可选功能。启用方法请参阅[本指南](/docs/getting-started)。
::

## 可视化 frontmatter 编辑

现在，你无需编写 `YAML` 语法就能编辑 Markdown 的 frontmatter。Nuxt Studio 会自动生成一个简单易用的表单，让元数据编辑变得更加轻松。

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1729157955/frontmatterform2_rmh58v.jpg" src="https://res.cloudinary.com/nuxt/video/upload/v1729157955/frontmatterform2_rmh58v.mp4"}

## 什么是 frontmatter？

frontmatter 是基于 Markdown 的 CMS 中的一种约定，用于为页面提供元数据，例如描述、标题等。在 [Nuxt Content](/docs/files/markdown#front-matter) 中，frontmatter 使用 YAML 语法。

::callout{icon="i-lucide-info" to="/docs/files/markdown#front-matter"}
有关 frontmatter 语法的更详细信息，请查阅 Nuxt Content 文档。
::

## 非技术用户编辑器的最后一块拼图

Nuxt Studio 的设计初衷就是面向非技术用户，自我们的编辑器发布以来尤其如此。我们的目标是让人人都能轻松编辑 Markdown 与内容。

frontmatter 的自动表单生成是顺理成章的下一步。摆脱 YAML 语法的复杂性之后，我们为非开发者简化了整个流程，并提供图片选择器、日期选择器、布尔开关等动态输入方式。这一改进为我们带来了完全可视化、简单易用的内容管理体验。

## 扩展到所有 YAML 和 JSON 文件

不久之后，表单生成功能将扩展到你在 Nuxt Studio 中编辑的所有 `YAML` 和 `JSON` 文件，让结构化数据的处理比以往更加轻松。

## 展望 Nuxt Content v3

::callout{icon="i-lucide-lightbulb"}
本节只是 [Nuxt Content v3](https://github.com/nuxt/content/tree/v3) 的预告。我们很快会发布更详细的博客文章。
::

我们正在积极推进 Nuxt Content 的下一个重大版本，它将带来显著的性能提升和新功能，进一步提升你的内容管理体验。

### 性能提升

Nuxt Content v2 的一大关键挑战是存储所有内容文件所需的庞大打包体积。在部署到 [NuxtHub](https://hub.nuxt.com/) 这类边缘平台时，这会成为问题。

为此，Nuxt Content v3 在生产环境中不再使用基于文件的存储，转而采用 SQL 数据库系统。这一转变对用户是透明的。我们为开发模式、静态生成、服务端渲染以及通过 NuxtHub 进行的边缘部署提供了零配置支持。

### 引入集合

集合是 Nuxt Content 项目中相关内容的组合。它们有助于更高效地组织和管理大规模数据集。

#### 定义集合

你可以在 `content.config.ts` 文件中定义集合，Nuxt Content 用它来配置数据库结构、工具类型，以及用于查找、解析和查询内容的方法。

#### 集合 schema

schema 用于保证集合内的一致性，并改善 TypeScript 类型提示，从而更好地与 Nuxt Content 工具集成。

```ts [content.config.ts]
import { defineCollection, z } from '@nuxt/content'

// Export collections
export const collections = {
  // Define collection using `defineCollection` utility
  posts: defineCollection({
    // Specify the type of content in this collection
    type: 'page',
    // Load every file matching this pattern
    source: 'blog/**/*.md',
    // Define custom schema for this collection
    schema: z.object({
      date: z.date(),
      image: z.object({
        src: z.string(),
        alt: z.string()
      }),
      badge: z.object({
        label: z.string(),
        color: z.string()
      })
    })
  }),
}
```

### 以 Nuxt Studio 为核心设计

::warning
本文发布于 v3.7 之前，迁移方法请参阅[本指南](https://github.com/nuxt/content/blob/main/CHANGELOG.md#370-2025-09-12)。
::

Nuxt Studio 最初是与 Nuxt Content v2 一同开发的，而在 v3 中，我们在构建该模块时充分考虑了 Nuxt Studio 的使用体验。我们的目标是打造最好的内容编辑 CMS 平台，同时依然提供最佳的开发者体验。

例如，集合 schema 将帮助我们进一步增强 Studio 中的表单生成。除此之外，你还可以直接在 schema 中为字段设置编辑器类型。

```ts [content.config.ts]
image: z.object({
    src: z.string().editor({ type: 'media' })
    alt: z.string()
}),
icon: z.string().editor({ type: 'icon' })
```

::callout{icon="i-lucide-lightbulb" to="https://github.com/nuxt/content/tree/main"}
Nuxt Content v3 已正式发布。欢迎试用并向我们反馈意见。
::
