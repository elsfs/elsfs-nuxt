---
prose: true
seo:
  title: 面向 Nuxt 项目的基于 Git 的 CMS
  description: Nuxt Content 是 Nuxt 的一个模块，让你可以在 Git 仓库中轻松管理应用的内容。开发者可以用 Markdown、YAML 或 JSON 文件编写内容，然后在应用中查询并展示这些内容。
  ogImage: https://content.nuxt.com/social.png
---

::u-page-hero
---
orientation: horizontal
---
  :::code-group
  ```mdc [content/index.md]
  ---
  title: The Mountains Website
  description: A website about the most iconic mountains in the world.
  ---

  ::my-vue-hero-component{orientation="horizontal"}
  #title
  Welcome to the Mountains Website.
  #description
  This is a description of the Mountains Website.
  ::

  This is a paragraph with **bold** and _italic_ text.
  ```

  ```vue [pages/index.vue]
  <script setup lang="ts">
  const { data } = await useAsyncData('home', () => {
    return queryCollection('content').path('/').first()
  })

  useSeoMeta({
    title: data.value?.title,
    description: data.value?.description
  })
  </script>

  <template>
    <ContentRenderer :value="data" />
  </template>
  ```
  :::

#headline
  :::u-button
  ---
  class: mb-3 rounded-full
  size: sm
  to: https://nuxt.studio
  trailing-icon: i-lucide-arrow-right
  variant: outline
  ---
  Nuxt Studio 正式发布
  :::

#title
面向 Nuxt 的 [基于 Git]{.text-primary} :br CMS。

#description
Nuxt Content 是 Nuxt 的一个模块，让你可以轻松管理应用的内容。开发者可以用 Markdown、YAML 或 JSON 文件编写内容，然后在应用中查询并展示这些内容。

#links
  :::u-button
  ---
  label: 快速上手
  size: lg
  to: /docs/getting-started/installation
  trailingIcon: i-lucide-arrow-right
  ---
  :::

:u-input-copy{value="npx nuxt module add content"}
::

::u-container{.pb-12.xl:pb-24}
  :::u-page-grid
    ::::u-page-feature
    ---
    icon: i-lucide-files
    ---
    #title{unwrap="p"}
    基于文件的 CMS

    #description{unwrap="p"}
    用 Markdown、YAML、CSV 或 JSON 编写内容，并在组件中查询这些内容。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-filter
    ---
    #title{unwrap="p"}
    查询构建器

    #description{unwrap="p"}
    用类似 MongoDB 的 API 查询内容，在恰当的时刻获取恰当的数据。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-database
    ---
    #title{unwrap="p"}
    由 SQLite 驱动

    #description{unwrap="p"}
    为内容添加自定义字段，使其适用于各类项目。
    ::::

    ::::u-page-feature
    ---
    icon: i-simple-icons-markdown
    ---
    #title{unwrap="p"}
    Markdown 与 Vue

    #description{unwrap="p"}
    在 Markdown 文件中使用 Vue 组件，支持 props、插槽和嵌套组件。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-list-minus
    ---
    #title{unwrap="p"}
    代码高亮

    #description{unwrap="p"}
    通过支持 VS Code 主题的 Shiki 集成，在网站上展示精美的代码块。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-mouse-pointer-click
    ---
    #title{unwrap="p"}
    可视化编辑器

    #description{unwrap="p"}
    让团队通过 Nuxt Studio —— 我们的可视化编辑器 —— 来编辑你的 Nuxt Content 项目。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-panel-left
    ---
    #title{unwrap="p"}
    导航生成

    #description{unwrap="p"}
    从内容文件生成结构化对象，几分钟内就能展示出导航菜单。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-heading-1
    ---
    #title{unwrap="p"}
    Prose 组件

    #description{unwrap="p"}
    用 Vue 组件自定义 HTML 排版标签，让你的内容保持统一的风格。
    ::::

    ::::u-page-feature
    ---
    icon: i-lucide-globe
    ---
    #title{unwrap="p"}
    随处部署

    #description{unwrap="p"}
    Nuxt Content 可用于所有托管服务商：静态、服务端、Serverless 与边缘。
    ::::
  :::
::

::u-page-section
#title
内容管理所需的一切

#description
将基于文件的简洁性与 Vue 组件的强大能力结合起来。从文档页面到复杂应用，构建内容丰富的网站。

  :::div{.hidden.md:block}
  :u-color-mode-image{.size-full.absolute.top-0.inset-0 dark="/home/features-dark.svg" light="/home/features-light.svg"}
  :::
::

::u-page-section
---
reverse: true
orientation: horizontal
---
  :::tabs
    ::::tabs-item{icon="i-lucide-eye" label="预览"}
      :::::browser-frame
        ::::::example-landing-hero
        ---
        image: /mountains/everest.jpg
        ---
        #title
        珠穆朗玛峰

        #description
        珠穆朗玛峰是世界最高峰，海拔 8,848 米。
        ::::::
      :::::
    ::::

    ::::tabs-item{icon="i-simple-icons-markdown" label="content/index.md"}
    ```mdc [content/index.md]
    ---
    title: The Mountains Website
    description: A website about the most iconic mountains in the world.
    ---

    ::landing-hero
    ---
    image: /mountains/everest.jpg
    ---
    #title
    The Everest.

    #description
    The Everest is the highest mountain in the world, standing at 8,848 meters above sea level.
    ::

    ```
    ::::

    ::::tabs-item
    ---
    icon: i-simple-icons-vuedotjs
    label: components/LandingHero.vue
    ---

    ```vue [components/LandingHero.vue]
      <script setup lang="ts">
      defineProps<{
        image: string 
      }>()
      </script>
      
      <template>
        <section class="flex flex-col sm:flex-row sm:items-center gap-4 py-8 sm:gap-12 sm:py-12">
          <div>
            <h1 class="text-4xl font-semibold">
              <slot name="title" />
            </h1>
            <div class="text-base text-gray-600 dark:text-gray-300">
              <slot name="description" />
            </div>
          </div>
          <img :src="image" class="w-1/2 rounded-lg">
        </section>
      </template>
    ```
    ::::
  :::

#title
Markdown 遇上 [Vue]{.text-(--ui-primary)} 组件

#description
我们创造了 MDC 语法，让你可以在 Markdown 文件中使用带 props 和插槽的 Vue 组件。

#features
  :::u-page-feature
  ---
  icon: i-lucide-list
  ---
  #title{unwrap="p"}
  用 frontmatter 语法指定 props
  :::

  :::u-page-feature
  ---
  icon: i-lucide-hash
  ---
  #title{unwrap="p"}
  用 `#` 使用组件插槽
  :::

  :::u-page-feature
  ---
  icon: i-lucide-code-xml
  ---
  #title{unwrap="p"}
  添加任意其他 HTML 属性
  :::

#links
  :::u-button
  ---
  color: neutral
  label: 进一步了解 MDC
  to: /docs/files/markdown#mdc-syntax
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  :::
::

::u-page-section
---
orientation: horizontal
---
  :::tabs
    ::::tabs-item{icon="i-simple-icons-vuedotjs" label="pages/blog.vue"}
    ```vue [pages/blog.vue]
    <script setup lang="ts">
    const { data: posts } = await useAsyncData('blog', () => {
      return queryCollection('blog').all()
    })
    </script>

    <template>
      <div>
        <h1>Blog</h1>
        <ul>
          <li v-for="post in posts" :key="post.id">
            <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
          </li>
        </ul>
      </div>
    </template>
    ```
    ::::

    ::::tabs-item{icon="i-simple-icons-typescript" label="content.config.ts"}
    ```ts [content.config.ts]
    import { defineContentConfig, defineCollection } from '@nuxt/content'
    import { z } from 'zod'

    export default defineContentConfig({
      collections: {
        blog: defineCollection({
          source: 'blog/*.md',
          type: 'page',
          // Define custom schema for docs collection
          schema: z.object({
            tags: z.array(z.string()),
            image: z.string(),
            date: z.Date()
          })
        })
      }
    })
    ```
    ::::
  :::

#title
带[类型安全]{.text-(--ui-secondary)}的查询

#description
用集合定义内容结构，并在查询时获得模式校验与完整的类型安全。

#features
  :::u-page-feature
  ---
  icon: i-lucide-layout-grid
  ---
  #title{unwrap="p"}
  为同类内容文件创建集合
  :::

  :::u-page-feature
  ---
  icon: i-lucide-circle-check
  ---
  #title{unwrap="p"}
  为集合的 frontmatter 定义模式
  :::

  :::u-page-feature
  ---
  icon: i-lucide-text-cursor
  ---
  #title{unwrap="p"}
  在 Vue 文件中获得自动补全
  :::

#links
  :::u-button
  ---
  color: neutral
  label: 进一步了解内容集合
  to: /docs/collections/define
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  :::
::

::u-page-section
---
reverse: true
orientation: horizontal
---
:video{autoplay controls loop src="https://res.cloudinary.com/nuxt/video/upload/v1767647099/studio/studio-demo_eiofld.mp4"}

#title{unwrap="p"}
让[任何人都能编辑]{.text-(--ui-primary)}你的网站

#description
  :::u-button
  ---
  color: primary
  target: _blank
  to: https://nuxt.studio
  variant: outline
  ---
  试用 Nuxt Studio
  :::

用 **Studio 模块** 编辑你的 Nuxt Content 网站，这是我们免费开源的 Web 可视化界面，可在生产环境中编辑内容。

#features
  :::u-page-feature
  ---
  icon: i-lucide-mouse-pointer-click
  ---
  #title{unwrap="p"}
  在生产网站上直接实时预览内容
  :::

  :::u-page-feature
  ---
  icon: i-lucide-file-text
  ---
  #title{unwrap="p"}
  面向 Markdown、YML 和 JSON 文件的可视化编辑器
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-git
  ---
  #title{unwrap="p"}
  直接在 Git 服务商上发布变更
  :::
::

::u-page-section
  :::div{.hidden.md:block}
  :u-color-mode-image{.size-full.absolute.bottom-0.inset-0.z-[-1] dark="/home/cta-dark.svg" light="/home/cta-light.svg"}
  :::

#title
为你的 Nuxt 项目添加基于 Git 的 CMS。

#links
:u-button{label="开始阅读文档" to="/docs/getting-started/installation" trailing-icon="i-lucide-arrow-right"}
::
