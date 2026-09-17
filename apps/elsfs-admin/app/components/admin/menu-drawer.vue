<script setup lang="ts">
import type { AdminMenuItem } from '~/types/menu'
import { countMenuLeaves, filterMenuTree } from '~/utils/admin-menu'

/**
 * 全部菜单抽屉（参考 onehip-frontend 的 navbar 菜单抽屉）。
 *
 * 三层结构：左侧一级菜单（子系统）列表 188px，选中项底色高亮；
 * 右侧是「搜索框 + 关闭按钮」，下面按 一级菜单名（h4）→ 二级分组名（h6）
 * → 四列叶子菜单网格 展示，菜单项 hover 出现星标。
 * 抽屉本身没有 header，关闭按钮和参考项目一样放在搜索框右侧。
 */
const show = defineModel<boolean>({ required: true })

const { t } = useI18n()
const menuStore = useMenuStore()
const router = useRouter()
const menuTitle = useMenuTitle()
const menuPath = useMenuPath()

/** 当前选中的一级菜单下标 */
const activeCategory = ref(0)
const keyword = ref('')

/** 搜索时跨一级菜单展示命中结果，未搜索时只展示当前一级菜单（和参考项目一致） */
const visibleMenus = computed<AdminMenuItem[]>(() => {
  const kw = keyword.value.trim()
  if (kw) {
    return filterMenuTree(menuStore.menus, kw, menuTitle)
  }
  const current = menuStore.menus[activeCategory.value]
  return current ? [current] : []
})

/** 过滤后剩下的叶子菜单数量，用于空状态判断 */
const visibleCount = computed(() => countMenuLeaves(visibleMenus.value))

function selectCategory(index: number): void {
  activeCategory.value = index
  // 和参考项目一致：点一级菜单清空搜索
  keyword.value = ''
}

async function handleSelect(item: AdminMenuItem): Promise<void> {
  show.value = false
  await router.push(menuPath(item))
}
</script>

<template>
  <ElDrawer
    v-model="show"
    direction="ltr"
    size="min(1148px, 92%)"
    :show-close="false"
    :with-header="false"
    class="admin-menu-drawer"
  >
    <div class="flex h-full min-h-0 flex-nowrap">
      <!-- 左：一级菜单 -->
      <nav class="bg-muted/50 flex w-[188px] shrink-0 flex-col overflow-y-auto py-2">
        <button
          v-for="(item, index) in menuStore.menus"
          :key="item.id"
          type="button"
          class="flex h-11 shrink-0 cursor-pointer items-center gap-2 pl-3 text-left text-sm transition-colors"
          :class="
            activeCategory === index && !keyword
              ? 'bg-background text-primary dark:bg-foreground/10 font-bold'
              : 'text-foreground hover:bg-background/60 dark:hover:bg-foreground/5'
          "
          @click="selectCategory(index)"
        >
          <AppIcon :name="item.icon ?? 'menu'" fallback="menu" class="size-4 shrink-0" />
          <span class="truncate">{{ menuTitle(item.title) }}</span>
        </button>
      </nav>

      <!-- 右：搜索 + 菜单 -->
      <div class="flex min-w-0 flex-1 flex-col">
        <!-- 搜索框 + 关闭按钮 -->
        <div class="flex h-15 shrink-0 items-center gap-5 px-5 py-2.5">
          <div class="relative min-w-0 flex-1">
            <span
              class="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center"
            >
              <AppIcon name="search" class="size-4" />
            </span>
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('admin.searchPlaceholder')"
              class="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-10 w-full rounded-lg border pr-9 pl-9 text-sm transition-colors outline-none focus:ring-2"
            />
            <button
              v-if="keyword"
              type="button"
              class="text-muted-foreground hover:bg-accent hover:text-foreground absolute inset-y-0 right-2 my-auto flex size-6 items-center justify-center rounded-full transition-colors"
              :aria-label="t('admin.clearSearch')"
              @click="keyword = ''"
            >
              <AppIcon name="close" class="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            class="text-muted-foreground hover:text-foreground flex size-6 shrink-0 cursor-pointer items-center justify-center transition-colors"
            :aria-label="t('admin.closeMenuList')"
            @click="show = false"
          >
            <AppIcon name="close" class="size-5" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <template v-if="visibleCount">
            <section v-for="item in visibleMenus" :key="item.id" class="mb-5">
              <!-- 一级：子系统 / 分类（参考项目用主色加粗） -->
              <h4 class="text-primary mb-2 text-sm font-bold">
                {{ menuTitle(item.title) }}
              </h4>

              <!-- 二级：分组 -->
              <div v-for="group in item.children" :key="group.id" class="mb-3 last:mb-0">
                <h6 class="text-muted-foreground mb-1 text-xs font-semibold">
                  {{ menuTitle(group.title) }}
                </h6>

                <!-- 三级：叶子菜单，四列 -->
                <div class="grid grid-cols-2 gap-x-4 md:grid-cols-3 lg:grid-cols-4">
                  <div
                    v-for="child in group.children"
                    :key="child.id"
                    class="group/row hover:bg-accent relative flex h-8 items-center rounded transition-colors"
                  >
                    <button
                      type="button"
                      class="text-foreground flex h-full min-w-0 flex-1 cursor-pointer items-center pl-3 text-left text-sm"
                      @click="handleSelect(child)"
                    >
                      <span class="truncate">{{ menuTitle(child.title) }}</span>
                    </button>

                    <ElTooltip
                      :content="
                        menuStore.isFavorite(child.id)
                          ? t('admin.removeFavorite')
                          : t('admin.addFavorite')
                      "
                      placement="bottom-start"
                      :show-after="0"
                    >
                      <button
                        type="button"
                        class="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded transition-opacity"
                        :class="
                          menuStore.isFavorite(child.id)
                            ? 'text-primary opacity-100'
                            : 'text-muted-foreground/70 hover:text-primary opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100'
                        "
                        :aria-label="
                          menuStore.isFavorite(child.id)
                            ? t('admin.removeFavorite')
                            : t('admin.addFavorite')
                        "
                        @click="menuStore.toggleFavorite(child.id)"
                      >
                        <AppIcon name="star-filled" class="size-4" />
                      </button>
                    </ElTooltip>
                  </div>
                </div>
              </div>
            </section>
          </template>

          <div
            v-else
            class="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20 text-sm"
          >
            <AppIcon name="search" class="size-8 opacity-40" />
            {{ t('admin.searchEmpty') }}
          </div>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>
