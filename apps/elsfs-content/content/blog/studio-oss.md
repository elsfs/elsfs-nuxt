---
title: Nuxt Studio 现已免费开源
description: 我们正式将 Nuxt Studio 发布为免费、开源、可自托管的模块。旧的 nuxt.studio 平台即将下线，并成为官方文档站点。你的内容编辑体验仍将延续，而且由你自己做主。
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
  - name: Ahad Birang
    avatar:
      src: https://avatars.githubusercontent.com/u/2047945?v=4
    to: https://x.com/farnabaz
    username: farnabaz
  - name: Sébastien Chopin
    avatar:
      src: https://avatars.githubusercontent.com/u/904724?v=4
    to: https://x.com/atinux
    username: atinux
categories: []
category: release
date: 2026-01-05
draft: false
image:
  src: /blog/Nuxt-Studio-is-Dead.png
  alt: Nuxt Studio 正式版发布
seo:
  title: Nuxt Studio 现已免费开源
  description: 我们正式将 Nuxt Studio 发布为免费、开源、可自托管的模块。旧的 nuxt.studio 平台即将下线。你的内容编辑体验仍将延续，而且由你自己做主。
---

**Nuxt Studio 已死，Nuxt Studio 万岁。**

我们承诺过会在 2025 年底前交付，今天我们兑现了这个承诺：正式发布 Nuxt Studio 的首个稳定版，一个**免费、开源的 Nuxt 模块**。同时，我们让旧的 [nuxt.studio](https://nuxt.studio) 平台下线，它现在成为了新的官方文档站点。

::u-button
---
color: neutral
icon: i-simple-icons-github
target: _blank
to: https://github.com/nuxt-content/nuxt-studio
variant: outline
---
在 GitHub 上了解 Nuxt Studio 模块。
::

## 🌄 为什么让 [nuxt.studio](https://nuxt.studio) 下线

当 NuxtLabs 加入 Vercel 时，我们承诺会让付费产品免费开源。我们正在沿用已经在 [Nuxt UI](https://ui.nuxt.com) 上采用、并即将应用到 [NuxtHub](https://hub.nuxt.com) 的同一思路。

对我们而言，这意义重大。这是一个让我们全身心投入打造**免费、开源、人人可用**的工具的机会。

正因如此，Studio 平台将停止服务。

## 🚀 认识全新的 Studio 模块

我们把 Studio 从零重建为一个 Nuxt 模块。成果是一套完全自托管的内容管理方案，与你的 Nuxt Content 网站一起运行。

### 有什么不同？

- **自托管** —— 完全运行在你自己的基础设施上，与你的 Nuxt 应用同处一地
- **免费开源** —— 基于 MIT 许可证发布
- **开发环境集成** —— 在开发模式下同样可用

## 📦 功能特性

这个稳定版包含了在生产环境编辑内容所需的一切：

### TipTap 可视化编辑器

现代化的类 Notion Markdown 编辑体验回归，并带来了改进版本：由 [TipTap](https://tiptap.dev/) 驱动，通过 [Nuxt UI Editor](https://ui.nuxt.com/components/editor) 组件集成：

- 富文本编辑，支持标题、格式、链接等
- 支持 MDC 组件，可插入 Vue 组件
- Vue 组件 props 编辑器，可视化编辑属性
- 拖拽调整内容块顺序
- 斜杠命令，快速调用格式设置
- 可视化内容与 MDC 语法之间实时互转

### 基于表单的编辑器

根据你的[集合定义](/docs/collections/define)自动生成基于模式的表单：

- 为 frontmatter、YAML 和 JSON 文件自动生成表单
- 用于选择媒体和图标的自定义输入组件
- 原生类型映射（string → 文本，boolean → 开关，enum → 下拉选择）
- 支持数组与对象

### 文件操作

针对 `content/` 目录的完整 CRUD 操作：创建、编辑、删除、重命名和移动文件，并内置草稿管理。

### 媒体管理

集中管理 `public/` 目录中静态资源的媒体库，支持上传、整理和预览。

### Git 集成

直接提交到 GitHub 或 GitLab，支持冲突检测、作者归属和自定义提交信息。

### 实时预览

在生产网站上实时预览草稿改动，即时更新并支持并排编辑。

### 多语言支持

Studio 界面支持 17 种语言，包括英语、法语、德语、西班牙语、日语、中文等。

### 认证方式

支持多种认证提供商：GitHub OAuth、GitLab OAuth、Google OAuth，或使用你自己的流程自定义认证。

## 📦 快速开始

使用 Nuxt CLI 安装模块：

```bash [Terminal]
npx nuxt module add nuxt-studio
```

在本地开始编辑，或为生产环境配置你的仓库：

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  studio: {
    repository: {
      provider: 'github',
      owner: 'your-username',
      repo: 'your-repo',
      branch: 'main'
    }
  }
})
```

::tip{to="https://nuxt.studio/setup"}
按照完整的配置指南获取详细的安装说明。
::

## 📅 下线时间表

::prose-steps
### 现在

你已经可以迁移到新模块。所有现有的订阅均已取消。

### 2026 年

旧的 nuxt.studio 平台将成为新的官方文档站点，而我们会日复一日地持续改进这个模块。
::

::note
[nuxt.studio](http://nuxt.studio) 平台一直只是一个编辑层。你的内容存放在自己的 Git 仓库中，始终由你完全掌控。平台下线对你已部署的网站或其行为没有任何影响。
::

## 🔄 迁移指南

迁移非常简单：

1. **安装模块**：按照[配置文档](https://nuxt.studio/setup)操作
2. **配置认证**：设置 [GitHub](https://nuxt.studio/git-providers#github)、[GitLab](https://nuxt.studio/git-providers#gitlab) 或 [Google OAuth](https://nuxt.studio/auth-providers#google)
3. **清理旧代码**：即将发布的 Nuxt Content 版本会自动移除所有旧的 Studio 代码，但你现在就可以删掉 Nuxt Content 配置中的 `preview` 键。

## 🗺 下一步

我们致力于让这个开源模块的体验更上一层楼。以下是 2026 年的计划：

- **AI 驱动的内容生成** —— 智能内容建议与辅助
- **开放 TipTap 扩展** —— 我们会公开自己构建的 TipTap 扩展（与 MDC 语法相关），让你可以在 [Nuxt UI Editor](https://ui.nuxt.com/docs/components/editor) 中使用。
- **社区驱动的功能** —— 由你的反馈塑造

## 🙏 感谢

你的反馈塑造了旧的 Studio，也塑造了新的 Studio。你的支持让这次转变成为可能。

感谢 Vercel 促成这一切，感谢他们推动开源的决心。

我们很期待看到你用全新的 Nuxt Studio 模块构建出什么。欢迎在 [GitHub Discussions](https://github.com/nuxt-content/nuxt-studio/discussions) 参与讨论，或[加入我们的 Discord](https://discord.gg/sBXDm6e8SP)，一起塑造内容编辑的未来。

---

如果你在迁移中需要帮助，欢迎来我们的 [Discord 服务器](https://discord.gg/sBXDm6e8SP)找我们。
