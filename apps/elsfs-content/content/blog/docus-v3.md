---
title: Docus，王者归来
description: Nuxt 文档主题与 CLI 回来了，v3 从零重写。
seo:
  title: Docus v3 —— Nuxt 文档主题的回归
date: 2025-06-13T00:00:00.000Z
category: content
image:
  src: https://docus.dev/__og-image__/static/og.png
  alt: Docus 落地页
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
---

我们彻底重写了 [Docus](https://docus.dev) 主题。以 Nuxt 生态为动力、由 Nuxt UI 设计，用全新而现代的基础让它重获新生，带来最佳的文档体验。

目标很简单：取 **Nuxt 生态中最优秀的部分**，打造一个强大、优雅且易于维护的文档主题。

## **Docus v3 有哪些新东西？**

### **📦 一个真正的** [Nuxt]{.text-primary} **应用，只需一个依赖**

Docus 构建在 [Nuxt 3](https://nuxt.com) 之上（已启用版本 4 兼容模式，所以我们已为 Nuxt 4 做好准备）。这意味着你的文档就是一个完整的 Nuxt 应用，可以使用 Nuxt 的全部功能：组件、模块、插件、运行时配置等等。

**不过**，**最棒的是**……你只需要 **docus** 这一个包。它打包了所有必要的官方 Nuxt 模块，几秒内就能开始写文档。你的应用里只需要一个 `package.json` 文件和一个存放 Markdown 的 `content/` 文件夹，就可以开始了。

::prose-tip{to="https://docus.dev/concepts/nuxt"}
在 Docus 的专属章节中进一步了解 Nuxt layer。
::

### **✨ 由** [Nuxt]{.text-primary} **UI Pro 设计**

Docus v2 由 **Nuxt UI Pro** 驱动，开箱即得美观、响应式且无障碍的文档主题。借助 **Tailwind CSS v4**、**CSS 变量**和 **Tailwind Variants API**，你的文档默认就很好看，同时完全可定制。

你可以在 `app.config.ts` 中做简单修改，全局或按组件调整颜色、排版和组件样式。

::prose-tip{to="https://docus.dev/concepts/theme"}
在 Docus 的专属章节中进一步了解 UI 主题定制。
::

::prose-note
目前仍需 UI Pro 许可证，但我们正在努力让它尽快对所有人免费。另外，如果你正在构建开源（OSS）文档，可以发邮件到 `ui-pro@nuxt.com` 申请 OSS 许可证。
::

### **✍️ 拥有超能力的 Markdown（MDC 语法由** [Nuxt]{.text-primary} **Content 提供）**

写文档从未如此简单，只差一个 Markdown 文件夹。更进一步，借助 Nuxt Content 和 MDC 语法，你可以在 Markdown 中嵌入可交互的 Vue 组件，并使用任意 Nuxt UI 组件或自己的自定义组件。

::prose-tip{to="https://docus.dev/concepts/edition"}
在 Docus 的专属章节中进一步了解 MDC 语法。
::

### 🖥️ [Nuxt]{.text-primary} Studio 就绪

Docus 与 **Nuxt Studio** 完美配合，让你完全在浏览器中管理和编辑文档。无需终端，无需本地环境。这是与非技术贡献者协作，或为团队集中管理文档的理想方式。

::prose-tip{to="https://docus.dev/getting-started/studio"}
在 Docus 的专属章节中进一步了解 Studio 编辑器。
::

### **🔍 开箱即用的 SEO**

技术 SEO 既麻烦又枯燥。Docus 提供一套扎实的、可选启用的默认配置，开箱即用，同时让你完全掌控 SEO 元数据的定制，从页面 meta 到社交分享图片。

::prose-tip{to="https://docus.dev/concepts/configuration"}
在 Docus 的专属章节中进一步了解应用配置。
::

### **🔧 通过组件覆盖实现全面定制**

需要替换布局或 UI 的某些部分？Docus 使用 **Nuxt Layers**，让你可以覆盖我们定义的核心组件。只需在项目的 `components/` 目录中创建一个同名组件，Docus 就会自动使用它。

::prose-tip{to="https://docus.dev/concepts/customization"}
在 Docus 的专属章节中进一步了解组件覆盖。
::

### **🤖** 默认集成 LLM

Docus 默认集成 `nuxt-llms`，为大型语言模型（LLM）准备好你的内容。你所有的文档页面都会被注入，`/llms.txt` 文件会自动生成并预渲染。

::prose-tip{to="https://docus.dev/concepts/llms"}
在 Docus 的专属章节中进一步了解 LLM 集成。
::

### **🧠 智能默认配置，文档即刻可用**

Docus 内置了周到的默认配置，帮你节省时间：

- ✅ 根据文件夹结构自动生成侧边栏导航
- 🔍 基于 Fuse.js 的全文搜索
- ✨ 优化的排版与布局
- 🌙 开箱即用的暗色模式
- 🖼️ 集成 Nuxt Image，实现响应式、优化的图片

### **🔁** 轻松迁移

从任何基于 Markdown 的方案迁移都很直接：把 `.md` 文件放进 `content/` 文件夹，就上线了。

## **接下来做什么？**

### **🔧 今天就试试 Docus**

```bash
npx docus init docs
```

就这样 🚀 你可以开始编辑 `content/` 文件夹，动手写文档了。

::prose-tip{to="https://docus.dev"}
访问文档，了解关于 Docus 的一切。
::

### **🤝 参与贡献**

我们已把仓库迁移到 **NuxtLabs** 的 GitHub 组织，并清理了 issue 跟踪器，从头开始。

无论你是修 bug、提功能建议，还是写文档，我们都欢迎你的帮助。关于 Docus 未来的反馈、贡献和讨论都同样欢迎！
