---
title: Nuxt Studio Alpha 版发布
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
category: Release
date: 2025-11-04T00:00:00.000Z
description: 介绍 Nuxt Studio 的首个 alpha 版本：一个免费、开源的 Nuxt 模块。借助 GitHub 集成与实时预览，直接在生产环境编辑内容。
draft: false
image:
  src: /blog/nuxt-studio-module-alpha.png
  alt: Nuxt Studio Alpha 版发布
---

当 NuxtLabs 加入 Vercel 时，我们承诺要把 [nuxt.studio](https://nuxt.studio) 从一个托管平台转变为一个免费、开源的模块。今天，我们很高兴地宣布 Nuxt Studio 模块的**首个 alpha 版本**正式发布。

::u-button{to="https://github.com/nuxt-content/nuxt-studio" icon="i-simple-icons-github" target="_blank" color="neutral" variant="subtle"}
在 GitHub 上了解 Nuxt Studio 模块。
::

现在你可以在生产环境中直接开启内容编辑，具备实时预览和 GitHub 集成，一切都在你自己的 Nuxt 应用内完成。

:video{controls loop src="https://res.cloudinary.com/nuxt/video/upload/v1733494722/contentv3final_rc8bvu.mp4"}

::u-button{to="/admin?redirect=/blog/studio-module-alpha" icon="i-lucide-mouse-pointer-click" external color="neutral" class="mt-4"}
试试编辑这个页面
::

## 🏠 从托管平台到自托管模块

这一里程碑离不开 Vercel 的支持。正是他们的支持，让我们能够投入必要的资源，把 Studio 重建为开源模块。

### 有什么不同？

Studio 最初是 [nuxt.studio](https://nuxt.studio) 上的托管平台，如今是一个免费开源的 Nuxt 模块，可以与你的 Nuxt Content 网站一起部署。

这意味着内容编辑者可以在生产环境、在自己的网站上直接管理和更新内容，无需本地开发工具，也不需要了解 Git。

- **自托管** —— 完全运行在你自己的基础设施上，与你的 Nuxt 应用同处一地
- **无外部依赖** —— 不需要任何 API 或第三方服务
- **免费开源** —— 基于 MIT 许可证发布
- **直接集成** —— 只需一个简单的 GitHub OAuth 应用即可开始

唯一的代价是，Studio 现在需要一个服务端路由来完成认证。虽然 [Nuxt 混合渲染](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering)依然支持静态生成，但你的站点必须部署在支持 SSR 的平台上。

## 📦 Alpha 版包含哪些内容

alpha 版本专注于**核心基础设施与稳定性**，避免引入可视化编辑器可能带来的 bug。我们使用 Monaco 编辑器，先确保所有文件操作和 GitHub 工作流足够可靠，再引入可视化编辑。

**Monaco 代码编辑器** → 类 IDE 的编辑体验，支持 Markdown、YAML 和 JSON 的语法高亮，完整支持 MDC 语法，并提供分屏差异对比视图用于处理冲突。

**文件操作** → 针对 `content/` 目录的完整 CRUD 操作。支持创建、编辑、删除、重命名和移动文件，并内置草稿管理。

**媒体管理** → 集中管理 `public/` 目录中静态资源的资源库，支持上传、整理、预览和引用。

**Git 集成** → 通过 OAuth 直接向 GitHub 提交，支持冲突检测、作者归属和自定义提交信息。

**实时预览** → 在生产网站上实时预览草稿改动，即时更新并支持并排编辑。

## 🗺️ 未来路线

### Beta 版发布 `Q4 2025`

借鉴我们在 [nuxt.studio](https://nuxt.studio) 上构建的成果，beta 阶段将引入开源可视化编辑器，让非技术用户也能轻松使用 Studio：

- **Markdown 编辑器** —— 灵感来自 Notion 的 Markdown 编辑体验
- **基于表单的编辑** —— 为 Markdown frontmatter、YAML 和 JSON 文件提供基于模式的表单
- **Vue 组件编辑** —— 用于编辑组件 props 和 slots 的可视化界面
- **Google OAuth** —— 为不使用 GitHub 的用户提供的另一种认证方式

### 稳定版发布 `2025 年底`

生产级功能、性能优化与更强的稳定性。

::warning
年底时，托管平台将会下线，模块将成为编辑 Nuxt Content 网站的唯一方式。
::

### `2026` 年及以后

AI 驱动的内容建议、支持更多 Git 提供商，以及社区驱动的功能。

## 🗄️ 存储架构

Studio 采用三层存储架构，让内容在浏览器与 GitHub 之间保持同步。

### 生产数据库 `SQLite WASM`

当你的 Nuxt Content 网站加载时，Nuxt Content v3 会从服务器下载一份 SQLite 数据库转储，并在本地初始化一个 WASM 数据库，其中包含你已部署分支上的全部内容。只要最近一次部署成功完成，这个数据库就会与 GitHub 保持同步。这就是 Studio 在你编辑内容时更新的生产数据库。

### 草稿存储 `IndexedDB`

Studio 使用由 IndexedDB 支持的 [unstorage](https://unstorage.unjs.io/) 维护一个独立的草稿层。编辑内容时，改动会作为草稿存储在本地浏览器中。每次 Studio 加载时，这些草稿会与 SQLite 数据库合并，渲染出一个带草稿的生产站点版本。

::note
草稿只存储在你的浏览器中，不会在编辑者之间或设备之间共享。
::

### GitHub 仓库 `API 集成`

发布时，Studio 会通过 GitHub API 把草稿改动直接提交到 GitHub。随后你的 CI/CD 流水线会自动重新构建并重新部署站点。部署完成后，你需要刷新页面，用最新内容更新浏览器中的数据库。

## 🔄 同步流程

### 初始加载

::prose-steps{level="4"}
#### 数据库初始化

Nuxt Content 下载构建过程中生成的 SQLite 数据库转储。 :br
该文件包含从你的 `content/` 目录解析出的全部内容。

#### 草稿恢复

Studio 检查 IndexedDB 中是否存在此前会话留下的草稿，并将它们载入 SQLite 数据库。

#### 预览

Studio 刷新站点预览，让你可以直接在生产网站上查看最新的草稿与改动。
::

### 编辑内容

::prose-steps{level="4"}
#### 草稿修改

改动会立即以草稿条目的形式保存在 IndexedDB 中，状态为 `created`、`modified` 或 `deleted`。

#### 数据库更新

本地 SQLite 数据库会更新以包含你的草稿内容，从而实现即时可视化预览。

#### 冲突检测

Studio 会将你的草稿内容与 GitHub 上的最新版本进行比较，以检测可能的冲突。

  :::note
  **以下情况可能产生冲突：**
  
  :br
  
  - 有人推送了修改同一文件的提交，而该版本正在构建中。
  - 部署失败或尚未完成，导致生产环境不是最新，与 GitHub 不同步。
  :::
::

### 发布改动

::prose-steps{level="4"}
#### 收集草稿

Studio 汇总所有包含改动的草稿条目。

#### 提交到 GitHub

Studio 使用 GitHub API 创建一个包含全部已更新文件的新提交。

#### 触发部署

你的 CI/CD 平台检测到该提交，自动重新构建并重新部署网站。

#### 等待部署

发布之后，Studio 会清除本地草稿并等待部署完成。 :br
在此期间会显示加载状态，直到生产环境的 SQLite 数据库追赶上你的最新提交。

  :::warning
  在你的提交部署完成之前，Studio 会保持等待状态，此时生产数据库尚未更新到最新。
  :::
::

## 🚀 立即开始

安装模块并配置你的 GitHub OAuth 应用，即可开始在生产环境编辑内容：

```bash
npx nuxi module add nuxt-studio@alpha
```

查看[配置指南](/docs/studio/setup)，了解完整的安装与配置说明。

---

我们很期待看到你用 Nuxt Studio 构建出什么。欢迎在 [GitHub Discussions](https://github.com/nuxt-content/nuxt-studio/discussions) 参与讨论，或[加入我们的 Discord](https://discord.gg/sBXDm6e8SP)，一起塑造这个模块的未来。
