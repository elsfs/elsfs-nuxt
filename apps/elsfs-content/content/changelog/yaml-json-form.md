---
name: Visual YAML and JSON File Edition
title: 可视化 YAML 和 JSON 文件编辑
description: 使用自动生成的表单编辑 YAML 和 JSON 文件。
date: 2024-10-28T01:00:00.000Z
image:
  src: /docs/studio/json-yml-forms.png
authors:
  - name: Baptiste Leproux
    to: https://x.com/_larbish
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
category: studio
---

::warning
本文发布于 2025 年 1 月 6 日 [Content](https://github.com/nuxt/content) 与 [Studio](https://github.com/nuxtlabs/studio-module) 模块合并之前，因此内容可能存在一些不一致之处。Studio 模块现已废弃，改为 Content 模块的可选功能。启用方法请参阅[本指南](/docs/getting-started)。
::

## 为 `YAML` 和 `JSON` 文件自动生成表单

:video{controls loop src="https://res.cloudinary.com/nuxt/video/upload/v1730132248/yml-json-form_n9czcs.mp4"}

为了让 Nuxt Studio 成为非技术用户编辑 Nuxt 网站内容的工具，我们一直在努力。现在我们很高兴地宣布：`YAML` 和 `JSON` 文件也可以通过自动生成的可视化表单进行编辑了。此次更新让用户无需再直接面对 YAML 或 JSON 这类复杂的文件语法。

::callout{icon="i-lucide-info"}
数组目前还不支持以表单形式处理，不过等 Nuxt Content v3 发布集合和用户自定义 schema 之后，我们就会着手实现。详见下文。
::

### 同步导航

除了这项更新，我们还改进了非 Markdown 格式（如 YAML 和 JSON）下预览与所选文件之间的同步导航。若要应用这一修复，请将 Studio 模块更新到最新版本 `v2.2.0`。

## 迈向 Nuxt Content v3

我们很高兴地宣布，Nuxt Content v3 的第四个 alpha 版本已经发布，[**草稿文档**](https://content.nuxt.com/)也已上线。

### 下一步计划

未来几个月，我们将专注于测试和完善 Nuxt Content v3，确保它稳定可靠、可用于生产环境。以下是 Nuxt Studio 相关改进的简要预告：

- **合并 Studio 模块**：不久之后，Studio 模块将直接集成到 Nuxt Content 中。待 Nuxt Content v3 发布后，只需在 `nuxt.config.ts` 文件中设置 `content.editor: true` 即可启用 Studio。这一简化意味着 Studio 不再需要额外的模块，配置过程也更快。
- **统一的文档**：随着模块的合并，我们还会把 [Content](https://content.nuxt.com) 和 [Studio](https://nuxt.studio) 的文档与网站整合为一个全面的资源。仅 Studio 平台（用户登录后可用）会保留为独立站点。
- **在 Studio 中利用数据结构和集合**：借助 Nuxt Content v3，Studio 平台将支持[集合](/docs/collections/define)和用户自定义 schema，并据此调整自身行为。这一增强使得 YAML 和 JSON 文件以及 Markdown 文件中的 frontmatter 都能使用由 schema 生成的表单。

这些更新体现了我们为 Nuxt 网站提供最佳内容编辑平台的承诺。敬请期待！
