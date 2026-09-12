---
title: Nuxt Studio v2 发布
description: 我们很高兴地宣布 Nuxt Studio v2 发布，为你的 Nuxt Content
  网站带来全新的编辑体验
image:
  src: /blog/nuxt-studio-v2.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
date: 2024-06-13T00:00:00.000Z
category: studio
---

::warning
本文发表于 2025 年 1 月 6 日 [Content](https://github.com/nuxt/content) 与 [Studio](https://github.com/nuxtlabs/studio-module) 模块合并之前，因此可能包含一些不一致的内容。Studio 模块现已弃用，改为 Content 模块中一个需手动启用的功能。启用方法见[本指南](/docs/getting-started)。
::

我们很高兴地宣布 Nuxt Studio v2 发布。这是一次重大更新，基于用户反馈，打造了专为我们的用户设计的全新界面。

::tip
Studio 针对 **Nuxt Content** 项目做了优化，但真正的要求只有一个：有一个包含 Markdown 文件的 *content* 文件夹。仅凭这样简单的配置，就能开始用平台编辑和发布你的文件。
::

## **更直观的界面**

![Nuxt Studio v2 界面](/blog/v2-interface.webp)

v2 的主要改进是**界面完全重做**。我们把它设计得更直观、更易用，尤其面向非技术用户。我们的目标是简化使用体验，让创建和配置项目更轻松、少折腾。新界面轻量、直接，旨在让你的工作流程更顺畅。

## **Google 认证**

![Google 与 GitHub 认证](/blog/google-github.webp)

现在我们有两种不同的认证方式。你可以用 **GitHub** 或 **Google** 登录。两种方式的编辑权限相同，但由于 Studio 与 GitHub 同步，部分功能仅适用于 GitHub 用户，尤其是创建项目。

::warning
由于 Google 用户无法创建项目，他必须**加入一个已有项目的团队**才能编辑这些项目。
::

## **几乎零配置即可编辑文件**

现在你**无需任何配置**就能编辑内容，只需导入仓库即可。你可以浏览文件和媒体、编辑内容并发布到 GitHub。

团队还支持协作。

![支持协作的类 Notion 编辑器](/blog/collaborate.webp)

::warning
在你配置好实时预览之前，编辑器中的媒体不会显示（见下文）。
::

## 更简单的实时预览配置

![在类 Notion 编辑器与网站之间启用实时预览](/blog/preview.webp)

由于实时预览功能需要一个已部署的 URL，我们尽可能简化了它的配置。

GitHub Pages 部署依然可用，也依然不需要你做任何配置；同时我们简化了自托管项目的要求，去掉了 token 校验。现在**唯一的要求**是[启用 Studio 模块](https://nuxt.studio/docs/get-started/setup#enable-the-live-preview)。

::warning{to="https://github.com/nuxtlabs/studio-module"}
为确保兼容性并能用上新功能，务必使用最新版本的 **Studio 模块**。
::

## 全新文档

平台焕然一新，[文档](https://nuxt.studio/docs/get-started/introduction)也随之更新。欢迎随时查阅，全面了解新版 Studio。

无论你是[编辑者](https://nuxt.studio/docs/editors/introduction)还是[开发者](https://nuxt.studio/docs/developers/introduction)，文档中现在都有专门的章节为你准备。

## Studio 的新方向

现有的大多数 CMS 方案都不得不在“对开发者高度可定制”与“对内容编辑者高度易用”之间二选一，而在 Studio，我们想两者兼得。

**由开发者提供工具，让编辑者专注于内容，无需任何技术知识**。

::tip
我们的类 Notion 编辑器前途光明，我们希望能与社区共同开发它。
::

##
