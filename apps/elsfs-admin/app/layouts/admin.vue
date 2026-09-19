<script setup lang="ts">
/**
 * 后台外壳布局（顶栏参考 onehip-frontend 的 navbar）。
 *
 * 顶栏：左「主页 + 全部菜单 + 平台名」、中「多页签」、右「消息 + 设置 + 用户」；
 * 下面再分左侧收藏夹窄栏与内容区。
 */
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

/** 全部菜单抽屉（桌面端 / 移动端共用） */
const showMenuDrawer = ref(false)
/** 移动端收藏菜单抽屉 */
const showMobileFavorites = ref(false)

/** 收藏夹是否收起（窄栏 -> 只留一条竖排文字），记 cookie 里 */
const favoritesCollapsed = useCookie<boolean>('elsfs_menu_rail_collapsed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
})

/* ---------- 多页签：进一个页面就记一个标签 ---------- */
watch(
  () => route.path,
  (path) => {
    const menu = menuStore.leafByPath(path)
    tabsStore.openTab({
      path,
      title: menu?.title ?? path,
      menuId: menu?.id,
      icon: menu?.icon,
      affix: menu?.meta.affixTab,
    })
  },
  { immediate: true },
)

/* ---------- 主题 ---------- */
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

/**
 * 服务端拿不到系统主题偏好（color-mode 默认存 localStorage），
 * 直接按 isDark 渲染文字会造成 hydration 不一致，挂载完成后再切换。
 */
const mounted = ref(false)
const showDarkIcon = computed(() => mounted.value && isDark.value)

onMounted(() => {
  mounted.value = true
  // 刷新后恢复登录用户（auth 中间件只校验 token，用户信息要靠接口拉回）
  void auth.fetchUser()
})

function toggleTheme(): void {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

/* ---------- 用户 ---------- */
const userName = computed(() => auth.user?.name || auth.user?.email?.split('@')[0] || 'user')
const userInitial = computed(() => userName.value[0]?.toUpperCase() ?? 'U')

function handleComingSoon(): void {
  ElMessage.info('该功能正在建设中')
}

function clearCache(): void {
  if (!import.meta.client) {
    return
  }
  localStorage.clear()
  sessionStorage.clear()
  ElMessage.success('缓存已清除')
}

async function handleUserCommand(command: string): Promise<void> {
  if (command === 'logout') {
    await auth.logout()
    await router.push('/auth/login')
    return
  }
  if (command === 'theme') {
    toggleTheme()
    return
  }
  if (command === 'clearCache') {
    clearCache()
    return
  }
  // 个人信息 / 修改密码等暂未实现
  handleComingSoon()
}

function goHome(): void {
  void router.push('/datshboard')
}

function browseFromMobile(): void {
  showMobileFavorites.value = false
  showMenuDrawer.value = true
}
</script>

<template>
  <div class="bg-background text-foreground flex h-screen w-full flex-col overflow-hidden">
    <!-- 顶栏 -->
    <header
      class="border-border bg-card/60 flex h-14 shrink-0 items-center gap-2 border-b pr-3 pl-2 sm:pr-4"
    >
      <!-- 左：主页 / 全部菜单 / 平台名 -->
      <ul class="flex shrink-0 items-center gap-1">
        <li>
          <ElTooltip content="主页" placement="bottom" :show-after="500">
            <button
              type="button"
              class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
              aria-label="主页"
              @click="goHome"
            >
              <AppIcon name="house" class="size-4" />
            </button>
          </ElTooltip>
        </li>
        <li>
          <ElTooltip content="全部菜单" placement="bottom" :show-after="500">
            <button
              type="button"
              class="hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
              :class="showMenuDrawer ? 'bg-accent text-primary' : 'text-muted-foreground'"
              aria-label="全部菜单"
              @click="showMenuDrawer = !showMenuDrawer"
            >
              <AppIcon :name="showMenuDrawer ? 'expand' : 'menu'" class="size-4" />
            </button>
          </ElTooltip>
        </li>
        <li class="md:hidden">
          <button
            type="button"
            class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
            aria-label="展开收藏菜单"
            @click="showMobileFavorites = true"
          >
            <AppIcon name="star-filled" class="size-4" />
          </button>
        </li>
        <li>
          <button
            type="button"
            class="text-foreground max-w-40 cursor-pointer truncate px-1 text-base"
            @click="showMenuDrawer = true"
          >
            ELSFS
          </button>
        </li>
      </ul>

      <!-- 中：多页签 -->
      <AdminTabsView class="hidden min-w-0 flex-1 md:flex" />

      <!-- 右：消息 / 设置 / 用户 -->
      <ul class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <li>
          <AdminNoticeBell />
        </li>
        <li>
          <ElTooltip content="系统设置" placement="bottom" :show-after="500">
            <button
              type="button"
              class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
              aria-label="系统设置"
              @click="handleComingSoon"
            >
              <AppIcon name="setting" class="size-4" />
            </button>
          </ElTooltip>
        </li>
        <li>
          <ElDropdown trigger="click" @command="handleUserCommand">
            <div
              class="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 transition-colors"
            >
              <span
                class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
              >
                {{ userInitial }}
              </span>
              <span class="hidden flex-col leading-tight sm:flex">
                <span class="text-foreground flex items-center gap-1 text-xs">
                  {{ userName }}
                  <span class="text-muted-foreground">管理员</span>
                </span>
                <span class="text-muted-foreground max-w-40 truncate text-[11px]">{{
                  auth.user?.email
                }}</span>
              </span>
              <AppIcon name="arrow-down" class="text-muted-foreground size-3 shrink-0" />
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="profile"> 个人信息 </ElDropdownItem>
                <ElDropdownItem command="password"> 修改密码 </ElDropdownItem>
                <ElDropdownItem command="clearCache"> 清除缓存 </ElDropdownItem>
                <ElDropdownItem divided command="theme">
                  <span class="flex items-center gap-2">
                    <AppIcon :name="showDarkIcon ? 'sun' : 'moon'" class="size-4" />
                    主题：{{ showDarkIcon ? '深色' : '浅色' }}
                  </span>
                </ElDropdownItem>
                <ElDropdownItem divided command="logout">
                  <span class="flex items-center gap-2">
                    <AppIcon name="switch-button" class="size-4" />
                    退出登录
                  </span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </li>
      </ul>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- 左侧：收藏夹（参考 onehip-frontend，窄栏 + 可收起） -->
      <aside
        class="border-border bg-card/30 hidden shrink-0 flex-col border-r transition-[width] duration-200 md:flex"
        :class="favoritesCollapsed ? 'w-9' : 'w-[76px]'"
      >
        <button
          type="button"
          class="text-muted-foreground hover:text-primary flex shrink-0 cursor-pointer items-center justify-center gap-0.5 py-2 text-[11px] transition-colors"
          :class="favoritesCollapsed ? 'flex-col gap-2' : 'flex-row'"
          :aria-label="favoritesCollapsed ? '我的收藏' : '收起'"
          @click="favoritesCollapsed = !favoritesCollapsed"
        >
          <span v-if="!favoritesCollapsed" class="leading-none">收起</span>
          <AppIcon
            :name="favoritesCollapsed ? 'd-arrow-right' : 'd-arrow-left'"
            class="size-3.5 shrink-0"
          />
          <span
            v-if="favoritesCollapsed"
            class="text-[11px] leading-none tracking-widest [writing-mode:vertical-rl]"
            >我的收藏</span
          >
        </button>
        <div
          v-if="!favoritesCollapsed"
          class="via-border h-px shrink-0 bg-gradient-to-r from-transparent to-transparent"
        />

        <AdminFavoriteMenus v-if="!favoritesCollapsed" @browse="showMenuDrawer = true" />
      </aside>

      <!-- 内容区 -->
      <main class="min-w-0 flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- 全部菜单抽屉 -->
    <AdminMenuDrawer v-model="showMenuDrawer" />

    <!-- 移动端收藏菜单 -->
    <ElDrawer v-model="showMobileFavorites" direction="ltr" size="72%">
      <template #header>
        <span class="text-foreground text-base font-semibold">后台管理</span>
      </template>
      <AdminFavoriteMenus wide @select="showMobileFavorites = false" @browse="browseFromMobile" />
    </ElDrawer>
  </div>
</template>
