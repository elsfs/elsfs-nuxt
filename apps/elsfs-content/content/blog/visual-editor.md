---
title: 深入 Nuxt Studio 可视化编辑器的幕后
description: 了解 Nuxt Studio 可视化编辑器的内部机制，以及它如何解析 Markdown 语法并将结果重新生成。
image:
  src: /blog/visual-editor.webp
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
  - name: Ferdinand Coumau
    avatar:
      src: https://avatars.githubusercontent.com/u/98885012?v=4
    to: https://x.com/CoumauFerdinand
    username: CoumauFerdinand
date: 2024-09-04T00:00:00.000Z
category: studio
---

## **引言**

Nuxt Studio 为开发者和内容写作者提供了一个多用途的工作区，让他们可以自由地在两种不同的编辑器之间选择，用于内容创作与管理：Markdown 编辑器和可视化编辑器。

![在项目设置中选择你喜欢的编辑器](/blog/favorite-editor.webp)

每种编辑器各有用途——有些用户习惯用 Markdown 编辑，另一些则更偏爱无需技术的可视化方式。

最终，**Markdown 语法是两种编辑器共同的最终产物**。

本文将讲解可视化编辑器背后的技术流程，探讨它如何解析 Markdown、如何转换回去，以及这个过程为何偶尔会导致内容与原文出现差异。

## **Markdown 编辑器**

![在 Nuxt Studio 中直接编辑 Markdown](/blog/markdown-editor.webp)

Nuxt Studio 的 Markdown 编辑器让你完全掌控内容，可以直接用 [MDC](/docs/files/markdown)（一种增强的 Markdown 语法）编写。这种语法允许把 Vue 组件直接集成到 Markdown 文件中，让你在组织页面时更灵活。

用 Markdown 编辑器保存文件时，内容会完全按你写的样子存储，保留所有特定语法和格式。对于熟悉 Markdown、希望对内容布局与结构有精确掌控的用户，这个编辑器最为理想。

## **可视化编辑器**

![在 Nuxt Studio 中使用可视化编辑器编辑内容](/blog/visual-editor.webp)

可视化编辑器是一种所见即所得（WYSIWYG）工具，构建在 [TipTap](https://tiptap.dev/) 和 [ProseMirror](https://prosemirror.net/) 之上，旨在把 Markdown 语法的复杂性隐藏起来，提供更直观的可视化编辑体验。对于不想直接面对 Markdown 原始代码的用户，这个编辑器尤其友好。

### **可视化编辑器如何处理文件**

当你用可视化编辑器打开一个 Markdown 文件时，Nuxt Studio 会先解析原始 Markdown 文件。它使用 [MDC 模块](https://github.com/nuxt-modules/mdc)生成抽象语法树（AST），再把该 AST 转换为 TipTap 兼容的格式（TipTap AST），从而让编辑器能准确地以可视化方式渲染文档。

一旦可视化编辑器显示出内容，用户就能以直观的可视化方式进行修改。在背后，编辑器会持续把 TipTap AST 转换回 MDC AST，再转成 MDC 语法，确保你的内容始终保持 Markdown 格式。

### **为什么用户没有修改，原始 markdown 文件也会发生变化**

![检测到自动 Markdown 解析时显示的提示](/blog/automatic-parsing-modal.webp)

#### **非关键性变更**

可视化编辑器在把可视化格式转换回 Markdown 时，会套用一个解析算法，应用预定义的 Markdown 标准。在某些情况下，这些标准可能与原始内容略有差异。这类变更通常没有实际影响，只是 Markdown 的另一种可用写法，渲染出的网站应与原来保持一致。

#### **关键性变更**

理想情况下，Markdown 中的每个特性在可视化编辑器里都有直接而准确的对应实现。我们构建了自定义 TipTap 扩展，以支持自定义 MDC 语法，比如 [Vue 组件](/docs/files/markdown#vue-components)编辑或 [front-matter](/docs/files/markdown#front-matter)。但在少数情况下，尤其是遇到复杂或不常规的 Markdown 元素时，可视化编辑器可能无法完全支持或正确解析它们。此时，编辑器在解析过程中可能会对这些元素做近似处理、简化，甚至直接省略。

这类差异在转换回 Markdown 时可能导致数据丢失或功能退化。虽然这种情况很少见，但它可能破坏你内容原本的展示效果或功能。

我们的首要目标是防止任何内容丢失，维护 Markdown 文件的完整性。如果你遇到可视化转 Markdown 不够完美的问题，欢迎在我们的 Discord 服务器上反馈。你的反馈对我们打磨和改进可视化编辑器、让它满足所有用户的需求极为宝贵。

## **减少意外变更的最佳实践**

为避免丢失关键格式或内容，可以参考以下最佳实践：

- **避免使用复杂的 HTML 结构**。既然 MDC 语法允许你集成 Vue 组件，那么更有效的做法是创建可复用的组件，以便轻松插入 Markdown 并在编辑器中编辑，而不是依赖复杂的 HTML 代码。
- **始终使用同一种编辑器。** 尽可能选择最适合你需求的编辑器，并在整个页面中坚持使用它。
- **在两种编辑器之间切换后检查改动。** 切换编辑器后，务必（在审阅页面）检查 Markdown 并查看预览，确认没有重要元素被改动。

## **结语**

在 Nuxt Studio 中于 Markdown 编辑器和可视化编辑器之间切换带来了灵活性，但也要注意其技术层面的影响。

理解可视化编辑器如何处理和转换 Markdown，有助于确保你在 Markdown 中精心写下的内容能准确呈现在可视化编辑器里，让非技术用户也能轻松编辑一切，而不改动原始 Markdown 文件。

###
