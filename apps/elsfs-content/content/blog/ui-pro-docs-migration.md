---
title: 迁移 Nuxt UI Pro 文档起步模板
description: 如何把 Nuxt UI Pro 文档升级到 Content 和 UI v3
image:
  src: /blog/migrate-docs-starter.png
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
date: 2025-01-21T01:00:00.000Z
category: Migration
---

# 如何把你的 Nuxt 文档网站升级到 Content × UI v3

**2025 年以“3”的力量开场！**

年初伊始，我们喜爱的工具迎来了重大更新。UI 团队即将发布 **UI / UI Pro 库的 v3**（目前处于 alpha 阶段），而 Content 团队已经发布了 **Nuxt Content v3**。

这些更新意味着，我们所有结合 **Content** 与 **UI** 的起步模板都需要升级以对齐最新版本。为帮助你完成过渡，本指南将带你把 **Nuxt UI Pro Docs Starter** 迁移到新的 **Content v3 与 Nuxt UI v3** 包。

::prose-tip{to="https://github.com/nuxt-ui-pro/docs/tree/v3"}
查看 UI Pro 文档起步模板仓库的源码。
::

## Content 迁移（v2 → v3）

### 1. 把包更新到 v3

::code-group
```bash [pnpm]
pnpm add @nuxt/content@^3
```

```bash [yarn]
yarn add @nuxt/content@^3
```

```bash [npm]
npm install @nuxt/content@^3
```

```bash [bun]
bun add @nuxt/content@^3
```
::

### 2. 创建 `content.config.ts` 文件

这个配置文件定义了你的数据结构。一个集合代表一组相关的条目。就文档起步模板而言，它有两个不同的集合：`landing` 集合代表首页，另一个 `docs` 集合用于文档页面。

```js [content.config.ts]
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.yml'
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.yml']
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    })
  }
})
```

除了 [`page`](/docs/collections/types#page-type) 类型提供的内置字段外，我们还为 `docs` 集合添加了额外的 `links` 字段，以便可选地在文档[页面头部](https://ui3.nuxt.dev/components/page-header)中展示它们。

::prose-tip
`type: page` 表示内容文件与站点页面之间是一一对应的关系。
::

### 3. 迁移 `app.vue`

::prose-steps{level="4"}
#### 导航数据的获取可以从 `fetchContentNavigation` 改为 `queryCollectionNavigation` 方法

  :::prose-code-group
  ```ts [app.vue (v3)]
  const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
  
  ```
  
  ```ts [app.vue (v2)]
  const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
  ```
  :::

#### 内容搜索命令面板的数据可以使用新的 `queryCollectionSearchSections` 方法

  :::prose-code-group
  ```ts [app.vue (v3)]
  const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
    server: false,
  })
  ```
  
  ```ts [app.vue (v2)]
  const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
    default: () => [],
    server: false
  })
  ```
  :::
::

### 4. 迁移落地页

::prose-steps{level="4"}
#### 首页数据获取可以从 `queryContent` 改为 `queryCollection` 方法

  :::prose-code-group
  ```ts [index.vue (v3)]
  const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
  ```
  
  ```ts [index.vue (v2)]
  const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())
  ```
  :::

#### 可以用 [page](/docs/collections/types#page-type) 类型提供的 `seo` 字段来填充 `useSeoMeta`

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  请注意，如果未设置，`seo` 字段会被根级的 `title` 和 `description` 自动覆盖。
  :::
::

### 5. 迁移文档全捕获页面

::prose-steps{level="4"}
#### 文档页面数据与前后篇数据的获取可以从 `queryContent` 改为 `queryCollection` 和 `queryCollectionItemSurroundings` 方法，从而合并处理

  :::prose-code-group
  ```ts [docs/[...slug\\].vue (v3)]
  const { data } = await useAsyncData(route.path, () => Promise.all([
    queryCollection('docs').path(route.path).first(),
    queryCollectionItemSurroundings('docs', route.path, {
      fields: ['title', 'description'],
    }),
  ]), {
    transform: ([page, surround]) => ({ page, surround }),
  })
  
  const page = computed(() => data.value?.page)
  const surround = computed(() => data.value?.surround)
  ```
  
  ```ts [docs/[...slug\\].vue (v2)]
  const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())
  
  const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryContent()
    .where({ _extension: 'md', navigation: { $ne: false } })
    .only(['title', 'description', '_path'])
    .findSurround(withoutTrailingSlash(route.path))
  )
  ```
  :::

#### 用 [page](/docs/collections/types#page-type) 类型提供的 `seo` 字段填充 `useSeoMeta`

```ts [index.vue]
useSeoMeta({
  title: page.value.seo.title,
  ogTitle: `${page.value.seo.title} - ${seo?.siteName}`,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
```

  :::prose-note
  请注意，如果未设置，`seo` 字段会被根级的 `title` 和 `description` 自动覆盖。
  :::
::

### 6. 更新类型

Content v3 对类型做了大幅增强，大多数手动类型声明已不再需要，因为现在由 Nuxt Content 的 API 直接提供。

就文档起步模板而言，唯一需要的类型声明是导航项：把 `NavItem` 替换为 `ContentNavigationItem` 即可。

```ts
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
```

### 7. 替换文件夹元数据文件

所有 `_dir.yml` 文件都改为 `.navigation.yml`

### 8. 迁移 Studio 的启用方式

由于 [Studio 模块](https://nuxt.studio)已弃用，且 Nuxt Content 中直接实现了新的通用 `Preview API`，我们可以从依赖和 `nuxt.config.ts` 的 modules 中移除 `@nuxthq/studio` 包。

取而代之，我们只需在 Nuxt 配置文件中绑定 Studio API 来启用预览模式。

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
})
```

::prose-tip
就这样，Content v3 现在驱动着这个起步模板。接下来我们迁移到 [Nuxt UI / UI Pro](https://ui3.nuxt.dev) 的 v3。
::

## Nuxt UI Pro 迁移（v1 → v3）

::prose-caution
本文只针对迁移本身，不会覆盖版本升级带来的所有破坏性变更。你应当逐一检查文档中使用的每个组件，确认 props、slots 或样式是否需要调整。
::

### 1. 把包配置到 v3

::prose-note
为了与 UI 的版本编号保持一致（UI 从 v1 过渡到了 v2），Nuxt UI Pro 跳过了 v2，直接升级到 v3。
::

::prose-steps{level="4"}
#### 安装 Nuxt UI v3 alpha 包

  :::code-group{sync="pm"}
  ```bash [pnpm]
  pnpm add @nuxt/ui-pro@next
  ```
  
  ```bash [yarn]
  yarn add @nuxt/ui-pro@next
  ```
  
  ```bash [npm]
  npm install @nuxt/ui-pro@next
  ```
  
  ```bash [bun]
  bun add @nuxt/ui-pro@next
  ```
  :::

#### 在 Nuxt 配置文件中添加模块

不再需要在 modules 中添加 `@nuxt/ui`，因为它会由 `@nuxt/ui-pro` 自动引入。

  :::prose-code-group
  ```ts [nuxt.config.ts (v3)]
  export default defineNuxtConfig({
    modules: ['@nuxt/ui-pro']
  })
  ```
  
  ```ts [nuxt.config.ts (v1)]
  export default defineNuxtConfig({
    extends: ['@nuxt/ui-pro'],
    modules: ['@nuxt/ui']
  })
  ```
  :::

  :::prose-note
  **Nuxt UIPro V3** 现在被视为一个模块，而不再是一个 layer。
  :::

#### 在 CSS 中引入 Tailwind CSS 和 Nuxt UI Pro

```css [assets/css/main.css]
@import "tailwindcss" theme(static);
@import "@nuxt/ui-pro";
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro'],
  css: ['~/assets/css/main.css']
})
```

#### 删除 tailwind 配置文件，改用 CSS 优先的主题方案

Nuxt UI v3 使用 Tailwind CSS v4，采用 CSS 优先的配置方式。现在你可以在 `@theme` 指令中用 CSS 变量自定义主题。

- 删除 `tailwind.config.ts` 文件
- 在 `main.css` 文件中使用 `@theme` 指令应用你的主题
- 使用 `@source` 指令，让 Tailwind 能检测 `markdown` 文件中的类名。

```css [assets/css/main.css]
@import "tailwindcss" theme(static);
@import "@nuxt/ui-pro";

@source "../content/**/*";

@theme {
  --font-sans: 'DM Sans', sans-serif;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

```
::

### 2. 更新 `app.config.ts` 中的 `ui` 覆盖配置

::prose-caution{to="https://ui3.nuxt.dev/getting-started/theme#customize-theme"}
组件中使用 `ui` props 或在 `app.config.ts` 中使用 `ui` 键的所有覆盖写法都已过时，需要对照 **UI / UI Pro** 文档逐一检查。
::

::prose-code-group
```ts [app.config.ts (v3)]
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    }
  },
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-gray-200 dark:border-gray-800',
        left: 'text-sm text-gray-500 dark:text-gray-400'
      }
    }
  },
}
```

```ts [app.config.ts (v1)]
export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800'
      }
    }
  },
})
```
::

### 3. 迁移 `error.vue` 页面

新的 `UError` 组件可以用作整页结构。

::prose-code-group
```vue [error.vue (v3)]
<template>
  <div>
    <AppHeader />

    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </div>
</template>
```

```vue [error.vue (v1)]
<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UPageError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>

    <UNotifications />
  </div>
</template>
```
::

### 4. 迁移 `app.vue` 页面

- 在我们的场景中，`Main`、`Footer` 和 `LazyUContentSearch` 组件无需任何改动。
- `Notification` 组件可以移除，因为 `Toast` 组件已由 `App` 组件直接处理。
- 可以改用 `NavigationMenu` 组件或 `ContentNavigation` 组件来展示内容导航，替代 `NavigationTree` 组件。

::prose-code-group
```vue [Header.vue (v3)]
<script>
// Content navigation provided by queryCollectionNavigation('docs')
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UHeader>
    <template #content>
      <UContentNavigation
        highlight
        :navigation="navigation"
      />
     </template>
   </UHeader>
</template>
```

```vue [Header.vue (v1)]
<script>
// Content navigation provided by fetchContentNavigation()
const navigation = inject<Ref<NavItem[]>>('navigation')
</script>

<template>
  <UHeader>
    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
     </template>
   </UHeader>
</template>
```
::

### 5. 更新落地页

我们决定把落地页内容从 `YML` 迁移到 `Markdown`。

::prose-tip
这样做是因为 Markdown 中使用的组件不再需要全局暴露（也不需要放在 `components/content` 文件夹里）。Content v3 会在底层处理这些。
::

::prose-steps{level="4"}
#### 更新内容配置

```ts [content.config.ts]
export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md'
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.md']
      },
      ...
    })
  }
})
```

#### 使用 `ContentRenderer` 渲染 `Markdown`

  :::prose-note
  必须在 `ContentRendered` 中把 `prose` 属性设为 `false`，因为对于集成了非 prose Vue 组件的落地页，我们不希望 `Mardown` 被套用 prose 样式。
  :::

  :::prose-code-group
  ```vue [index.vue (v3)]
  <template>
    <UContainer>
      <ContentRenderer
        v-if="page"
        :value="page"
        :prose="false"
      />
    </UContainer>
  </template>
  ```
  
  ```vue [index.vue (v1)]
  <template>
    <div>
      <ULandingHero
        v-if="page.hero"
        v-bind="page.hero"
      >
        <template #headline>
          <UBadge
            v-if="page.hero.headline"
            variant="subtle"
            size="lg"
            class="relative rounded-full font-semibold"
          >
            <NuxtLink
              :to="page.hero.headline.to"
              target="_blank"
              class="focus:outline-none"
              tabindex="-1"
            >
              <span
                class="absolute inset-0"
                aria-hidden="true"
              />
            </NuxtLink>
  
            {{ page.hero.headline.label }}
  
            <UIcon
              v-if="page.hero.headline.icon"
              :name="page.hero.headline.icon"
              class="ml-1 w-4 h-4 pointer-events-none"
            />
          </UBadge>
        </template>
  
        <template #title>
          <MDC cache-key="head-title" :value="page.hero.title" />
        </template>
  
        <MDC
          :value="page.hero.code"
          cache-key="head-code"
          class="prose prose-primary dark:prose-invert mx-auto"
        />
      </ULandingHero>
  
      <ULandingSection
        :title="page.features.title"
        :links="page.features.links"
      >
        <UPageGrid>
          <ULandingCard
            v-for="(item, index) of page.features.items"
            :key="index"
            v-bind="item"
          />
        </UPageGrid>
      </ULandingSection>
    </div>
  </template>
  ```
  :::

#### 把 Vue 组件迁移到 MDC

按照 [MDC 语法](/docs/files/markdown)把所有组件移到 `index.md` 中。

落地页组件已被重新组织并统一为通用的 `Page` 组件。

- `LandingHero` => `PageHero`
- `LandingSection` => `PageSection`
- `LandingCard` => `PageCard`（不过我们会改用 `PageFeature`）

  :::prose-tip{to="https://github.com/nuxt-ui-pro/docs/blob/v3/content/index.md"}
  在 GitHub 上查看最终的 `Markdown` 结果。
  :::
::

### 6. 迁移文档页面

::prose-steps{level="4"}
#### 布局

- `Aside` 组件已重命名为 `PageAside`。
- 可以使用 `ContentNavigation` 组件（替代 `NavigationTree`）来展示由 `queryCollectionNavigation` 返回的内容导航。

  :::prose-code-group
  ```vue [layout/docs.vue (v3)]
  <template>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <UContentNavigation
              highlight
              :navigation="navigation"
            />
          </UPageAside>
        </template>
  
        <slot />
      </UPage>
    </UContainer>
  </template>
  ```
  
  ```vue [layout/docs.vue (v1)]
  <template>
    <UContainer>
      <UPage>
        <template #left>
          <UAside>
            <UNavigationTree :links="mapContentNavigation(navigation)" />
          </UAside>
        </template>
  
        <slot />
      </UPage>
    </UContainer>
  </template>
  ```
  :::

#### 全捕获页面

- `Divider` 已重命名为 `Separator`
- `findPageHeadline` 必须从 `#ui-pro/utils/content` 导入
- `PageBody` 组件上已不再有 `prose` 属性。
::

::prose-tip{to="https://github.com/nuxt-ui-pro/docs/tree/v3"}
搞定！文档起步模板现在完全运行在 UI 与 Content v3 之上 🎉
::

## 在 Studio 中编辑

如果你使用 Nuxt Studio 编辑文档，也需要迁移相关代码。

Studio 模块已弃用，Nuxt Content 中直接实现了新的通用 `Preview API`，你可以从依赖和 `nuxt.config.ts` 的 modules 中移除 `@nuxthq/studio` 包。取而代之，只需在 Nuxt 配置文件中绑定 Studio API 来启用预览模式。

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
})
```

为了让 app config 文件仍可从 Studio 更新，你需要把 `nuxt.schema.ts` 文件中 helper 的引入路径从 `@nuxthq/studio/theme` 改为 `@nuxt/content/preview`。

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1737458923/studio/docs-v3_lqfasl.png" src="https://res.cloudinary.com/nuxt/video/upload/v1737458923/studio/docs-v3_lqfasl.mp4"}
