<script setup lang="ts">
import { resolveMenuPath } from '~/utils/admin-menu'

/**
 * 收藏菜单列表。
 *
 * 左侧栏（桌面端）和移动端抽屉复用同一份内容；
 * `browse` 由外壳组件接住并打开「全部菜单」抽屉。
 */
const emit = defineEmits<{
  select: [id: string]
  browse: []
}>()

const { t } = useI18n()
const route = useRoute()
const menuStore = useMenuStore()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex items-center justify-between px-3 py-3">
      <span class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t('admin.myFavorites') }}
      </span>
      <span
        v-if="menuStore.favoriteCount"
        class="rounded-full bg-accent px-1.5 py-0.5 text-[11px] text-muted-foreground"
      >
        {{ menuStore.favoriteCount }}
      </span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
      <template v-if="menuStore.favoriteCount">
        <div
          v-for="group in menuStore.favoriteGroups"
          :key="group.id"
          class="mb-3"
        >
          <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
            <AppIcon
              :name="group.icon ?? 'folder'"
              class="size-3.5 shrink-0"
            />
            <span class="truncate">{{ group.name }}</span>
          </div>

          <NuxtLink
            v-for="item in group.items"
            :key="item.id"
            :to="resolveMenuPath(item)"
            class="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
            :class="route.path === resolveMenuPath(item)
              ? 'bg-accent font-medium text-primary'
              : 'text-foreground hover:bg-accent/60'"
            @click="emit('select', item.id)"
          >
            <AppIcon
              :name="item.icon ?? 'document'"
              class="size-4 shrink-0"
              :class="route.path === resolveMenuPath(item) ? 'text-primary' : 'text-muted-foreground'"
            />
            <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>

            <!-- 嵌套在链接里，点击时必须阻止跳转 -->
            <span
              role="button"
              tabindex="0"
              class="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
              :title="t('admin.removeFavorite')"
              :aria-label="t('admin.removeFavorite')"
              @click.prevent.stop="menuStore.removeFavorite(item.id)"
              @keydown.enter.prevent.stop="menuStore.removeFavorite(item.id)"
            >
              <AppIcon
                name="close"
                class="size-3.5"
              />
            </span>
          </NuxtLink>
        </div>
      </template>

      <div
        v-else
        class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-3 py-6 text-center"
      >
        <AppIcon
          name="star"
          class="size-6 text-muted-foreground/60"
        />
        <div class="text-sm text-foreground">
          {{ t('admin.emptyFavorites') }}
        </div>
        <p class="text-xs leading-relaxed text-muted-foreground">
          {{ t('admin.emptyFavoritesHint') }}
        </p>
        <button
          type="button"
          class="mt-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click="emit('browse')"
        >
          {{ t('admin.allMenus') }}
        </button>
      </div>
    </div>
  </div>
</template>
