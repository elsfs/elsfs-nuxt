<script setup lang="ts">
import type { AppMenuItem } from '~/types/menu'
import { filterMenuTree, menuTileClass, resolveMenuPath } from '~/utils/admin-menu'

/**
 * 全部菜单抽屉。
 *
 * 左侧是「全部 + 一级菜单」导航，右侧是搜索框 + 按一级菜单分组的三列菜单网格；
 * 每项右侧的星标用于加入 / 移出左侧收藏栏。
 */
const show = defineModel<boolean>({ required: true })

const { t } = useI18n()
const menuStore = useMenuStore()
const router = useRouter()

/** 当前选中的一级菜单下标，-1 表示「全部」 */
const activeCategory = ref(-1)
const keyword = ref('')

const visibleMenus = computed(() => {
  const source = activeCategory.value === -1
    ? menuStore.menus
    : menuStore.menus.filter((_, index) => index === activeCategory.value)

  return filterMenuTree(source, keyword.value)
})

/** 过滤后剩下的可点击菜单数量，用于空状态判断 */
const visibleCount = computed(() =>
  visibleMenus.value.reduce((total, item) => total + (item.children?.length ?? 0), 0),
)

function selectCategory(index: number): void {
  activeCategory.value = index
}

async function handleSelect(item: AppMenuItem): Promise<void> {
  show.value = false
  await router.push(resolveMenuPath(item))
}
</script>

<template>
  <ElDrawer
    v-model="show"
    direction="ltr"
    size="min(1148px, 92%)"
    class="admin-menu-drawer"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-foreground">{{ t('admin.menuList') }}</span>
        <span class="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
          {{ t('admin.favoriteCount', { count: menuStore.favoriteCount }) }}
        </span>
      </div>
    </template>

    <div class="flex h-full min-h-0 gap-3 sm:gap-4">
      <!-- 一级菜单导航 -->
      <nav class="flex w-32 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border pr-2 sm:w-44">
        <button
          type="button"
          class="flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 text-left text-sm transition-colors"
          :class="activeCategory === -1
            ? 'bg-accent font-medium text-primary'
            : 'text-foreground hover:bg-accent/60'"
          @click="selectCategory(-1)"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            :class="activeCategory === -1 ? 'bg-primary text-primary-foreground' : menuTileClass()"
          >
            <AppIcon
              name="grid"
              class="size-4"
            />
          </span>
          <span class="truncate">{{ t('admin.all') }}</span>
        </button>

        <button
          v-for="(item, index) in menuStore.menus"
          :key="item.id"
          type="button"
          class="flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 text-left text-sm transition-colors"
          :class="activeCategory === index
            ? 'bg-accent font-medium text-primary'
            : 'text-foreground hover:bg-accent/60'"
          @click="selectCategory(index)"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            :class="activeCategory === index ? 'bg-primary text-primary-foreground' : menuTileClass(item.id)"
          >
            <AppIcon
              :name="item.icon ?? 'menu'"
              class="size-4"
            />
          </span>
          <span class="truncate">{{ item.name }}</span>
        </button>
      </nav>

      <!-- 搜索 + 菜单网格 -->
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="relative mb-3">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <AppIcon
              name="search"
              class="size-4"
            />
          </span>
          <input
            v-model="keyword"
            type="text"
            :placeholder="t('admin.searchPlaceholder')"
            class="h-10 w-full rounded-lg border border-border bg-background pr-9 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
          <button
            v-if="keyword"
            type="button"
            class="absolute inset-y-0 right-2 my-auto flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            :aria-label="t('admin.clearSearch')"
            @click="keyword = ''"
          >
            <AppIcon
              name="close"
              class="size-3.5"
            />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <template v-if="visibleCount">
            <section
              v-for="item in visibleMenus"
              :key="item.id"
              class="mb-5"
            >
              <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span class="h-3.5 w-1 rounded-full bg-primary" />
                {{ item.name }}
                <span class="text-xs font-normal text-muted-foreground">{{ item.children?.length ?? 0 }}</span>
              </h3>

              <!-- 一批四列：方形图标 + 菜单名，hover 出现星标收藏（参考 xjx-onehip-frontend） -->
              <div class="grid grid-cols-2 gap-x-3 gap-y-1 md:grid-cols-3 lg:grid-cols-4">
                <div
                  v-for="child in item.children"
                  :key="child.id"
                  class="group/row flex items-center rounded-lg transition-colors hover:bg-accent"
                >
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 pr-1 pl-1.5 text-left"
                    @click="handleSelect(child)"
                  >
                    <span
                      class="flex size-7 shrink-0 items-center justify-center rounded-lg"
                      :class="menuTileClass(item.id)"
                    >
                      <AppIcon
                        :name="child.icon ?? 'document'"
                        class="size-4"
                      />
                    </span>
                    <span class="min-w-0 flex-1 truncate text-sm text-foreground transition-colors group-hover/row:text-primary">{{ child.name }}</span>
                  </button>

                  <ElTooltip
                    :content="menuStore.isFavorite(child.id) ? t('admin.removeFavorite') : t('admin.addFavorite')"
                    placement="bottom-start"
                    :show-after="0"
                  >
                    <button
                      type="button"
                      class="flex size-6 shrink-0 items-center justify-center rounded-md transition-opacity"
                      :class="menuStore.isFavorite(child.id)
                        ? 'text-primary opacity-100'
                        : 'text-muted-foreground/70 opacity-0 hover:text-primary group-hover/row:opacity-100 focus-visible:opacity-100'"
                      :aria-label="menuStore.isFavorite(child.id) ? t('admin.removeFavorite') : t('admin.addFavorite')"
                      @click="menuStore.toggleFavorite(child.id)"
                    >
                      <AppIcon
                        name="star-filled"
                        class="size-4"
                      />
                    </button>
                  </ElTooltip>
                </div>
              </div>
            </section>
          </template>

          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 py-20 text-sm text-muted-foreground"
          >
            <AppIcon
              name="search"
              class="size-8 opacity-40"
            />
            {{ t('admin.searchEmpty') }}
          </div>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>
