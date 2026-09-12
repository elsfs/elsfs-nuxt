---
name: Studio Frontmatter Customization
title: Studio 表单自定义
description: Studio 表单根据内容配置文件中定义的集合 schema
  动态生成。
date: 2025-02-20T01:00:00.000Z
image:
  src: /blog/studio-form-generation.png
  alt: 基于集合 schema 生成 frontmatter 表单
authors:
  - name: Baptiste Leproux
    to: https://x.com/_larbish
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
category: content
draft: false
---

::warning
本文发布于 v3.7 之前，迁移方法请参阅[本指南](https://github.com/nuxt/content/blob/main/CHANGELOG.md#370-2025-09-12)。
::

[Studio](https://nuxt.studio) 的表单会根据内容配置文件中定义的集合 schema 动态生成。无论你编辑的是 `Markdown` 文件的 [frontmatter](/docs/files/markdown#frontmatter)，还是 `JSON` / `YAML` 文件，这一行为都适用。

:video{autoplay controls poster="https://res.cloudinary.com/nuxt/video/upload/v1739982761/frontmatterform_yjafgt.png" src="https://res.cloudinary.com/nuxt/video/upload/v1739982761/frontmatterform_yjafgt.mp4"}

## **用** `zod` Schema 定义表单

Nuxt Content 借助 [zod](https://github.com/colinhacks/zod) 让你为内容定义类型安全的 schema。该 schema 不仅能校验数据，还驱动着 **Studio** 中的表单生成。

### **内置 zod 辅助函数**

你可以通过为集合添加 `schema` 属性并使用 [zod](https://github.com/colinhacks/zod) schema 来定义内容 schema。

`@nuxt/content` 暴露了一个 `z` 对象，其中包含一组用于常见数据类型的 [Zod](/) 工具。

::prose-code-group
```ts [content.config.ts]
export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        draft: z.boolean().default(false),
        category: z.enum(['Alps', 'Himalaya', 'Pyrenees']).optional(),
        date: z.date(),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        slug: z.string().editor({ hidden: true }),
        icon: z.string().optional().editor({ input: 'icon' }),
        authors: z.array(z.object({
          slug: z.string(),
          username: z.string(),
          name: z.string(),
          to: z.string(),
          avatar: z.object({
            src: z.string(),
            alt: z.string(),
          }),
        })),
      }),
    }),
  },
})    
```

  :::code-preview{icon="i-lucide-eye" label="生成的表单"}
  ![表单预览](/docs/studio/preview-schema.png)
  :::
::

### **原生输入映射**

Zod 的基础类型会自动映射为 **Studio** 中合适的表单输入控件：

- **String** → 文本输入框
- **Date** → 日期选择器
- **Number** → 数字输入框（计数器）
- **Boolean** → 开关
- **Enum** → 下拉选择框
- **Arrays of strings** → 徽标输入列表
- **Arrays of objects** → 带内嵌表单的折叠项列表

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1740679550/arrayobjectandstring_r1jpvz.jpg" src="https://res.cloudinary.com/nuxt/video/upload/v1740679550/arrayobjectandstring_r1jpvz.mp4"}

### 自定义输入映射

内容远不止基础类型。你可以使用 `editor` 方法自定义表单字段，它为 Zod 类型扩展了元数据，从而增强编辑器界面。

这让你可以定义自定义输入控件或隐藏字段。

#### 用法

```ts [content.config.ts]
mainScreen: z.string().editor({ input: 'media' })
```

#### 选项

##### `input: 'media' | 'icon'`

你可以设置编辑器输入类型。目前提供 icon 和 media 两种，因为它们在 Studio 编辑器中都有对应的处理。

::prose-tip
Studio 的输入控件完全可扩展。我们可以根据用户需求创建任意数量的输入控件。
::

##### `hidden: Boolean`

设置该选项可以避免在 Studio 编辑器中显示某个字段。

##### `label: String`

你可以在 Studio 编辑器中设置字段的显示名称。

##### `description: String`

你可以在 Studio 编辑器的字段名称下方添加一段说明文字。

##### `tooltip: String`

在 Studio 编辑器的字段名称旁显示一个信息气泡。
