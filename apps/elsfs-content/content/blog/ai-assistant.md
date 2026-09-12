---
title: 认识 Docus 的 AI 助手
authors:
  - name: Hugo Richard
    avatar:
      src: https://avatars.githubusercontent.com/u/71938701?v=4
    to: https://x.com/hugorcd
    username: hugorcd
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
categories: []
category: docus
date: 2026-02-04T00:00:00.000Z
description: 只需一个环境变量，几秒内就能配置好你的助手。快速、实时的搜索。再用自定义工具把它变成你自己的助手。
draft: false
image:
  src: /blog/docus-assistant.png
  alt: Docus AI 助手界面
seo:
  title: 认识 Docus 的 AI 助手 | 为你的文档加入 AI
  description: 真正好用的 AI 文档搜索。生成代码，用自定义工具扩展。零基础设施，只需填入你的 API 密钥。
---

文档的价值，取决于用户能从中获得多少答案。我们推出 Docus AI 助手——一种原生、内嵌的对话体验，彻底改变开发者与你的文档互动的方式。

AI 助手会检索你的内容，并生成用户可直接复制的代码示例。最棒的是：**只需一个环境变量即可启用。**

:video{.w-full.h-auto.rounded-md autoplay controls loop muted playsinline src="https://res.cloudinary.com/nuxt/video/upload/v1770204403/studio/docus-assistant_e8xmxu.mp4"}

## 文档的发现难题

用户是带着问题来的，而不是带着关键词。他们翻遍导航、猜测搜索词、逐页扫读，只求找到所需内容。即便是组织良好的文档，也会在用户心中的问题与页面上的答案之间制造摩擦。

AI 改变了这种局面。用户不必再迁就你的导航结构去调整问题，而是可以用自然语言提问，并获得以你的真实文档为依据的回答。

## 一个环境变量即可启用

Docus 把 AI 配置的复杂性抽象掉，只需一个环境变量，就能启用属于你自己的 AI 助手对话。

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

::note
需要 **Vercel AI Gateway API 密钥**，除非你部署在 Vercel 上——那样就无需 API 密钥或任何配置。用 5 美元额度的免费试用体验一下吧！
::

就这样。部署你的文档，AI 助手便会自动启用。无需配置文件，无需配置 API，无需改动基础设施。

助手通过 [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) 工作，支持 OpenAI、Anthropic、Google 等提供商。你可以自由选择模型和预算，集成方式始终不变。

::prose-tip{to="https://docus.dev/en/ai/assistant#quick-start"}
在 Docus 文档中阅读完整的配置指南。
::

## 工作原理

### MCP 集成

AI 助手借助 **Model Context Protocol（MCP）**，让 AI 模型直接访问你的文档。架构很简单：

1. Docus 会自动在 `/mcp` 暴露一个 **MCP 服务器**，提供搜索和获取文档的工具
2. 当你提供 `AI_GATEWAY_API_KEY` 后，AI 模型便会连接到你的 MCP 服务器
3. AI 使用 MCP 工具实时检索你的文档，给出准确的回答

这种方式让每个回答都以真实内容为依据，从而避免幻觉。AI 只能基于你文档中的内容作答。

MCP 协议是一个开放标准，让 AI 模型能通过定义良好的工具与外部数据源交互。Docus 已自动实现这一切，你只需提供 API 密钥。

### AI 定制

MCP 集成的真正威力在于**可扩展性**。Docus 底层使用 `@nuxtjs/mcp-toolkit`，它允许你添加自定义工具，让 AI 助手的能力不止于搜索文档。

想让你的 AI 检查 API 状态、获取实时数据、运行代码示例，或者与自己的服务交互？在你的项目中添加自定义 MCP 工具即可：

```typescript [server/mcp/tools/check-api-status.ts]
export default defineMcpTool({
  description: 'Check the current status of the API',
  inputSchema: z.object({
    endpoint: z.string().describe('API endpoint to check')
  }),
  handler: async ({ endpoint }) => {
    const status = await checkEndpointStatus(endpoint)
    return {
      content: [{
        type: 'text',
        text: `API endpoint ${endpoint} is ${status}`
      }]
    }
  }
})
```

AI 助手会自动发现并使用你的自定义工具。用户现在可以问 **“API 是不是挂了？”**，并得到实时回答，而不只是文档内容。

::note
你可以通过以下方式定制 AI 助手的各个方面：

- **自定义工具**：用 `defineMcpTool` 在 `server/mcp/tools/` 中添加任意能力
- **资源（Resources）**：通过 `server/mcp/resources/` 暴露文件或数据
- **提示词（Prompts）**：在 `server/mcp/prompts/` 中创建可复用的提示词模板
- **自定义处理器**：为特定用例构建独立的 MCP 端点
::

::prose-tip{to="https://docus.dev/ai/mcp#customization"}
在 Docus 文档中进一步了解 MCP 定制。
::

### 问题配置

用户无需离开正在阅读的页面就能提问。助手理解当前上下文，并能引用你正在浏览的页面。

配置是可选的，但很有用。你可以在 `app.config.ts` 文件中预置常见问题、调整 UI 可见性、自定义键盘快捷键，或关闭不需要的功能。

```typescript [app.config.ts]
export default defineAppConfig({
  docus: {
    ai: {
      floatingInput: true,
      explainWithAI: true,
      faqs: [
        {
          question: 'How do I install Docus?',
          category: 'Getting Started'
        },
        {
          question: 'Can I customize the theme?',
          category: 'Customization'
        }
      ]
    }
  }
})
```

### 国际化

AI 助手会自动适配文档的语言设置。所有 UI 文案都会根据用户的语言环境翻译，助手也会用用户的语言作答。

如果你的文档支持多种语言，助手无需额外配置即可覆盖所有语言。同一个环境变量就能为每种语言环境启用 AI。

## 核心优势

### 为开发者打造

AI 助手融入开发者浏览文档的方式：

- **浮动输入框**（`Cmd/Ctrl+I`）：位于屏幕底部的对话窗口，可通过快捷键唤起
- **用 AI 解释按钮**：侧边栏按钮，带着当前页面上下文打开助手
- **侧滑面板**：保留对话历史，便于持续交流

### 代码生成

除了回答问题，助手还会根据你的文档范式生成代码示例。用户可以直接从对话中复制实现，不必再去示例仓库里翻找。

助手理解你的 API 结构，熟悉你的约定，生成的示例与你的文档风格保持一致。

### 隐私与掌控

你的文档内容始终由你掌控。AI 助手查询的是你已发布的文档，也就是站点上公开可见的同一份内容。没有单独的索引，没有数据收集，也没有外部数据库。

你可以通过 Vercel AI Gateway 掌控 AI 提供商，根据隐私要求、延迟需求或成本限制来选择模型。更换提供商无需改动任何文档代码。

## 立即开始

::prose-tip
**刚接触 Docus？** 创建一个内置 AI 助手的完整文档站点：

```bash
npx skills add nuxt-content/docus
```

然后在你的 AI agent（Claude、Cursor 或任何支持 skills 的 agent）中运行 `/create-docs`，自动生成全部内容。
::

已经有 Docus 站点了？用一个环境变量即可加入 AI 助手：

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

部署后助手会自动启用。

AI 助手代表着开发者与文档互动方式的转变。他们不再搜索答案，而是展开对话；不再逐行解读示例，而是直接生成代码。

::prose-tip{to="https://docus.dev/ai/assistant"}
阅读完整的 AI 助手文档。
::

## 下一步

我们一直在探索让文档更具交互性、更有帮助的新方式。当优秀的文档遇上智能工具，AI 助手只是一个开始。

文档正在从静态的参考资料演变为可交互的学习环境，我们很期待看到这段旅程会通向何方。
