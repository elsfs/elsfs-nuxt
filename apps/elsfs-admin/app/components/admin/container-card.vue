<script setup lang="ts">
/**
 *
 * 统一「查询区 / 列表 / 表单」的外壳：圆角、描边、背景，可选标题栏（标题 + 右侧操作区）
 * 与底部插槽。参考组件从它们的 tagsView store 取当前页签标题，这里改用本项目的
 * tabs store + `useMenuTitle()`，传了 `title` 时优先用传入值。
 */
const props = withDefaults(
  defineProps<{
    /** 标题文案；不传时回退到当前页签标题 */
    title?: string
    /** 是否显示标题栏（参考组件默认不显示） */
    showTitle?: boolean
    /** 标题按富文本渲染（后端菜单标题可能带 HTML） */
    showRichTitle?: boolean
    /** 内容超出是否裁剪（配合圆角，默认按参考组件裁剪） */
    isHidden?: boolean
    /** 内容区类名，默认 `p-4` */
    bodyClass?: string
  }>(),
  {
    title: '',
    showTitle: false,
    showRichTitle: false,
    isHidden: true,
    bodyClass: 'p-4',
  },
)

const route = useRoute()
const tabsStore = useTabsStore()
const menuTitle = useMenuTitle()

/** 标题：优先显式传入，否则回退到当前页签标题（与顶部页签一致） */
const displayTitle = computed<string>(() => {
  if (props.title) {
    return props.title
  }
  const tab = tabsStore.tabs.find((item) => item.path === route.path)
  return tab ? menuTitle(tab.title) : ''
})
</script>

<template>
  <section
    class="border-border bg-card flex w-full min-w-0 flex-col rounded-xl border"
    :class="isHidden ? 'overflow-hidden' : ''"
  >
    <div
      v-if="showTitle"
      class="border-border flex items-center justify-between gap-3 border-b px-4 py-3"
    >
      <!-- eslint-disable vue/no-v-html -->
      <h3
        v-if="showRichTitle"
        class="flex min-w-0 items-center gap-2 text-sm font-semibold [&_*]:truncate"
        v-html="displayTitle"
      />
      <!-- eslint-enable vue/no-v-html -->
      <h3 v-else class="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <span class="bg-primary h-4 w-1 shrink-0 rounded-full" />
        <span class="truncate">{{ displayTitle }}</span>
      </h3>
      <slot name="right" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col" :class="bodyClass">
      <slot />
    </div>

    <slot name="btn" />
  </section>
</template>
