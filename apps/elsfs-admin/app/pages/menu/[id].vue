<script setup lang="ts">
/**
 * 菜单占位页。
 *
 * 菜单树里没有真实页面的菜单统一跳到 `/menu/<id>`，
 * 这里按 id 反查菜单名并给出「建设中」提示，接入真实页面后删掉即可。
 */
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const menuStore = useMenuStore()

const menu = computed(() => menuStore.leafMap.get(String(route.params.id ?? '')))
</script>

<template>
  <div class="mx-auto max-w-3xl p-6 sm:p-8">
    <h1 class="text-xl font-bold sm:text-2xl">
      {{ menu?.name ?? t('admin.menuNotFound') }}
    </h1>
    <p
      v-if="menu"
      class="mt-2 text-sm text-muted-foreground"
    >
      {{ menu.parentName }} / {{ menu.name }}
    </p>

    <div class="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <AppIcon
        :name="menu?.icon ?? 'question-filled'"
        class="size-8 text-muted-foreground"
      />
      <div class="text-sm text-foreground">
        {{ t('admin.comingSoon') }}
      </div>
      <p class="text-xs leading-relaxed text-muted-foreground">
        {{ t('admin.comingSoonHint') }}
      </p>
    </div>
  </div>
</template>
