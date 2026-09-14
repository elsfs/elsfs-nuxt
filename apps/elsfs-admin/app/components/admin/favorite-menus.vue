<script setup lang="ts">
import type { AppMenuLeaf } from '~/types/menu'
import { menuTileClass, resolveMenuPath } from '~/utils/admin-menu'

/**
 * 收藏菜单列表
 *
 * 桌面端是窄栏：图标在上、名称在下，支持拖拽排序，hover 出现 × 二次确认删除；
 * 移动端抽屉里用 `wide`，改成横向一行一项。
 */
const props = withDefaults(defineProps<{ wide?: boolean }>(), { wide: false })

const emit = defineEmits<{
  select: [id: string]
  browse: []
}>()

const { t } = useI18n()
const route = useRoute()
const menuStore = useMenuStore()

function isActive(item: AppMenuLeaf): boolean {
  return route.path === resolveMenuPath(item)
}

function pathOf(item: AppMenuLeaf): string {
  return resolveMenuPath(item)
}

/* ---------- 拖拽排序：原生 HTML5 DnD，不额外引依赖 ---------- */
const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function handleDragStart(index: number, event: DragEvent): void {
  if (props.wide) {
    return
  }
  dragIndex.value = index
  overIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    // 拖拽过程中浏览器需要一份数据，这里只放个占位
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function handleDragOver(index: number): void {
  if (dragIndex.value !== null) {
    overIndex.value = index
  }
}

function handleDrop(index: number): void {
  const from = dragIndex.value
  resetDrag()
  if (from !== null) {
    menuStore.moveFavorite(from, index)
  }
}

function resetDrag(): void {
  dragIndex.value = null
  overIndex.value = null
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- 移动端标题栏 -->
    <div
      v-if="wide"
      class="flex items-center justify-between px-3 py-2"
    >
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

    <div
      class="min-h-0 flex-1 overflow-y-auto"
      :class="wide ? 'px-2 pb-3' : 'px-1.5 pb-3'"
    >
      <div
        v-if="menuStore.favoriteCount"
        class="flex flex-col"
        :class="wide ? 'gap-0.5' : 'gap-1'"
      >
        <!-- 一行一项 / 图标在上名称在下 -->
        <NuxtLink
          v-for="(item, index) in menuStore.favorites"
          :key="item.id"
          :to="pathOf(item)"
          :draggable="!wide"
          class="group relative flex rounded-lg transition-colors"
          :class="[
            wide ? 'items-center gap-2.5 px-2 py-1.5' : 'flex-col items-center gap-1 px-1 py-2',
            isActive(item)
              ? 'bg-accent text-primary'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            dragIndex !== null && overIndex === index && dragIndex !== index
              ? 'ring-2 ring-primary/60'
              : '',
          ]"
          @click="emit('select', item.id)"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index)"
          @drop.prevent="handleDrop(index)"
          @dragend="resetDrag"
        >
          <span
            class="flex shrink-0 items-center justify-center rounded-lg transition-colors"
            :class="[
              wide ? 'size-7' : 'size-9',
              isActive(item)
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : menuTileClass(item.parentId),
            ]"
          >
            <AppIcon
              :name="item.icon ?? 'document'"
              :class="wide ? 'size-4' : 'size-5'"
            />
          </span>

          <span
            :class="wide
              ? 'min-w-0 flex-1 truncate text-sm'
              : 'line-clamp-2 w-full text-center text-[11px] leading-tight break-all'"
          >{{ item.name }}</span>

          <!-- hover 出现：取消收藏（二次确认，避免误删） -->
          <ElPopconfirm
            :title="t('admin.confirmRemoveFavorite')"
            :confirm-button-text="t('common.confirm')"
            :cancel-button-text="t('common.cancel')"
            :width="180"
            @confirm="menuStore.removeFavorite(item.id)"
          >
            <template #reference>
              <span
                role="button"
                tabindex="0"
                class="absolute flex items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                :class="wide ? 'top-1/2 right-1 size-5 -translate-y-1/2' : 'top-0.5 right-0.5 size-4'"
                :title="t('admin.removeFavorite')"
                :aria-label="t('admin.removeFavorite')"
                @click.prevent.stop
                @keydown.enter.prevent.stop
              >
                <AppIcon
                  name="close"
                  :class="wide ? 'size-3' : 'size-2.5'"
                />
              </span>
            </template>
          </ElPopconfirm>
        </NuxtLink>
      </div>

      <!-- 空态 -->
      <div
        v-else
        class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-2 py-6 text-center"
      >
        <AppIcon
          name="star"
          class="size-6 text-muted-foreground/60"
        />
        <div
          class="text-sm text-foreground"
          :class="wide ? '' : 'text-xs'"
        >
          {{ t('admin.emptyFavorites') }}
        </div>
        <p
          v-if="wide"
          class="text-xs leading-relaxed text-muted-foreground"
        >
          {{ t('admin.emptyFavoritesHint') }}
        </p>
        <button
          type="button"
          class="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          :class="wide ? 'mt-1 text-xs' : 'text-[11px]'"
          @click="emit('browse')"
        >
          {{ t('admin.allMenus') }}
        </button>
      </div>
    </div>
  </div>
</template>
