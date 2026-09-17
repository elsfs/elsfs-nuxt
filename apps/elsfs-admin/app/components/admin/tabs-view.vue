<script setup lang="ts">
import type { AppTab } from '~/stores/tabs'

/**
 * 顶部多页签（参考 onehip-frontend 的 tagsView）。
 *
 * 点标签切换、× 关闭、右键出菜单（收藏 / 重新加载 / 关闭其他 / 关闭全部）、
 * 左右拖拽可以换顺序；标签顺序与开关状态存在 cookie 里。
 * 后端 `meta.affixTab` 的标签固定显示、不可关闭。
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const menuStore = useMenuStore()
const menuTitle = useMenuTitle()

/** 右键菜单：坐标 + 目标标签 */
const contextMenu = ref<{ x: number; y: number; tab: AppTab } | null>(null)

/* ---------- 拖拽排序 ---------- */
const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function handleDragStart(index: number, event: DragEvent): void {
  dragIndex.value = index
  overIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
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
    tabsStore.moveTab(from, index)
  }
}

function resetDrag(): void {
  dragIndex.value = null
  overIndex.value = null
}

/* ---------- 菜单信息 ---------- */
/** 标签对应的叶子菜单（按打开时记下的 menuId 取，占位页也能拿到） */
function menuOf(tab: AppTab) {
  return tab.menuId ? menuStore.leafMap.get(tab.menuId) : undefined
}

function isFavorite(tab: AppTab): boolean {
  const menu = menuOf(tab)
  return menu ? menuStore.isFavorite(menu.id) : false
}

/* ---------- 交互 ---------- */
async function goTab(tab: AppTab): Promise<void> {
  if (tab.path !== route.path) {
    await router.push(tab.path)
  }
}

async function closeTab(tab: AppTab): Promise<void> {
  const index = tabsStore.tabs.findIndex((item) => item.path === tab.path)
  tabsStore.closeTab(tab.path)
  if (tab.path !== route.path) {
    return
  }
  // 关掉的是当前页：跳到右边的，没有就左边的，再没有回工作台
  const next = tabsStore.tabs[index] ?? tabsStore.tabs[index - 1]
  await router.push(next?.path ?? '/datshboard')
}

function openContextMenu(tab: AppTab, event: MouseEvent): void {
  contextMenu.value = { x: event.clientX, y: event.clientY, tab }
}

function closeContextMenu(): void {
  contextMenu.value = null
}

function toggleFavorite(): void {
  const tab = contextMenu.value?.tab
  if (tab) {
    const menu = menuOf(tab)
    if (menu) {
      menuStore.toggleFavorite(menu.id)
    }
  }
  closeContextMenu()
}

/** 重新加载当前应用（标签 / 收藏都在 cookie 里，不会丢） */
async function reload(): Promise<void> {
  closeContextMenu()
  await reloadNuxtApp()
}

async function closeOthers(): Promise<void> {
  const tab = contextMenu.value?.tab
  if (tab) {
    tabsStore.closeOthers(tab.path)
    if (tab.path !== route.path) {
      await router.push(tab.path)
    }
  }
  closeContextMenu()
}

async function closeAll(): Promise<void> {
  tabsStore.closeAll()
  closeContextMenu()
  await router.push('/datshboard')
}

async function handleMoreCommand(command: string): Promise<void> {
  if (command === 'others') {
    const active = tabsStore.tabs.find((tab) => tab.path === route.path) ?? tabsStore.tabs[0]
    if (active) {
      tabsStore.closeOthers(active.path)
    }
    return
  }
  if (command === 'all') {
    await closeAll()
  }
}
</script>

<template>
  <div class="flex min-w-0 items-center gap-1">
    <div class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
      <div
        v-for="(tab, index) in tabsStore.tabs"
        :key="tab.path"
        draggable="true"
        class="group/tab flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md border pr-1 pl-2 transition-colors select-none"
        :class="[
          route.path === tab.path
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-background text-muted-foreground hover:text-foreground',
          dragIndex !== null && overIndex === index && dragIndex !== index
            ? 'ring-primary/60 ring-2'
            : '',
        ]"
        @click="goTab(tab)"
        @contextmenu.prevent="openContextMenu(tab, $event)"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver(index)"
        @drop.prevent="handleDrop(index)"
        @dragend="resetDrag"
      >
        <AppIcon v-if="tab.icon" :name="tab.icon" fallback="document" class="size-3.5 shrink-0" />
        <span class="max-w-28 truncate text-xs">{{ menuTitle(tab.title) }}</span>
        <button
          v-if="!tab.affix"
          type="button"
          class="hover:bg-accent hover:text-destructive flex size-4 shrink-0 items-center justify-center rounded-full transition-opacity"
          :class="route.path === tab.path ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100'"
          :aria-label="t('admin.closeTab')"
          @click.stop="closeTab(tab)"
        >
          <AppIcon name="close" class="size-3" />
        </button>
      </div>
    </div>

    <ElDropdown v-if="tabsStore.tabs.length" trigger="click" @command="handleMoreCommand">
      <button
        type="button"
        class="border-border text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors"
        :aria-label="t('admin.moreTabs')"
      >
        <AppIcon name="arrow-down" class="size-3.5" />
      </button>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem command="others">
            {{ t('admin.closeOthers') }}
          </ElDropdownItem>
          <ElDropdownItem command="all">
            {{ t('admin.closeAll') }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <!-- 右键菜单 -->
    <template v-if="contextMenu">
      <div
        class="fixed inset-0 z-40"
        @click="closeContextMenu"
        @contextmenu.prevent="closeContextMenu"
      />
      <div
        class="border-border bg-popover text-popover-foreground fixed z-50 min-w-32 overflow-hidden rounded-lg border py-1 text-sm shadow-md"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      >
        <button
          type="button"
          class="hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors"
          @click="toggleFavorite"
        >
          <AppIcon
            name="star-filled"
            class="size-3.5"
            :class="isFavorite(contextMenu.tab) ? 'text-primary' : 'text-muted-foreground'"
          />
          {{ isFavorite(contextMenu.tab) ? t('admin.removeFavorite') : t('admin.addFavorite') }}
        </button>
        <button
          type="button"
          class="hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors"
          @click="reload"
        >
          <AppIcon name="refresh" class="text-muted-foreground size-3.5" />
          {{ t('admin.reload') }}
        </button>
        <button
          type="button"
          class="hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors"
          @click="closeOthers"
        >
          <AppIcon name="close" class="text-muted-foreground size-3.5" />
          {{ t('admin.closeOthers') }}
        </button>
        <button
          type="button"
          class="hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors"
          @click="closeAll"
        >
          <AppIcon name="delete" class="text-muted-foreground size-3.5" />
          {{ t('admin.closeAll') }}
        </button>
      </div>
    </template>
  </div>
</template>
