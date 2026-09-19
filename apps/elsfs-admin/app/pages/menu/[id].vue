<script setup lang="ts">
/**
 * 菜单占位页。
 *
 * 后端菜单里没有对应页面的菜单统一跳到 `/menu/<id>`，
 * 这里按 id 反查菜单名并给出「建设中」提示，接入真实页面后删掉即可。
 */
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const menuStore = useMenuStore()
const menuTitle = useMenuTitle()

const menu = computed(() => menuStore.leafMap.get(String(route.params.id ?? '')))

/** 面包屑：一级 / 二级 / 菜单名 */
const breadcrumb = computed(() => {
  const leaf = menu.value
  if (!leaf) {
    return ''
  }
  return [leaf.rootTitle, leaf.groupTitle, leaf.title]
    .filter(Boolean)
    .map((title) => menuTitle(title))
    .join(' / ')
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-6 sm:p-8">
    <h1 class="text-xl font-bold sm:text-2xl">
      {{ menu ? menuTitle(menu.title) : '菜单不存在' }}
    </h1>
    <p v-if="menu" class="text-muted-foreground mt-2 text-sm">
      {{ breadcrumb }}
    </p>

    <div
      class="border-border mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center"
    >
      <AppIcon
        :name="menu?.icon ?? 'question-filled'"
        fallback="question-filled"
        class="text-muted-foreground size-8"
      />
      <div class="text-foreground text-sm">该功能正在建设中</div>
      <p class="text-muted-foreground text-xs leading-relaxed">
        菜单已经接好路由，替换成真实页面即可。
      </p>
    </div>
  </div>
</template>
