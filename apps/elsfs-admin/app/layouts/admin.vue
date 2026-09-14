<script setup lang="ts">
/**
 * 后台外壳布局（顶栏参考 onehip-frontend 的 navbar）。
 *
 * 顶栏：左「主页 + 全部菜单 + 平台名」、中「多页签」、右「消息 + 设置 + 用户」；
 * 下面再分左侧收藏夹窄栏与内容区。
 */
const { t, locale, locales, setLocale } = useI18n()

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
watch(() => route.path, (path) => {
  const menu = menuStore.leafByPath(path)
  tabsStore.openTab({
    path,
    title: menu?.title ?? path,
    menuId: menu?.id,
    icon: menu?.icon,
    affix: menu?.meta.affixTab,
  })
}, { immediate: true })

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

/* ---------- 语言 ---------- */
const localeItems = computed(() =>
  locales.value.map(item => ({ label: item.name || item.code, value: item.code })),
)

async function switchLocale(code: string): Promise<void> {
  if (code && code !== locale.value) {
    await setLocale(code as typeof locale.value)
  }
}

/* ---------- 用户 ---------- */
const userName = computed(() => auth.user?.name || auth.user?.email?.split('@')[0] || 'user')
const userInitial = computed(() => userName.value[0]?.toUpperCase() ?? 'U')

function handleComingSoon(): void {
  ElMessage.info(t('admin.comingSoon'))
}

function clearCache(): void {
  if (!import.meta.client) {
    return
  }
  localStorage.clear()
  sessionStorage.clear()
  ElMessage.success(t('admin.cacheCleared'))
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
  if (command.startsWith('locale:')) {
    await switchLocale(command.slice('locale:'.length))
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
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- 顶栏 -->
    <header class="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/60 pr-3 pl-2 sm:pr-4">
      <!-- 左：主页 / 全部菜单 / 平台名 -->
      <ul class="flex shrink-0 items-center gap-1">
        <li>
          <ElTooltip
            :content="t('admin.home')"
            placement="bottom"
            :show-after="500"
          >
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              :aria-label="t('admin.home')"
              @click="goHome"
            >
              <AppIcon
                name="house"
                class="size-4"
              />
            </button>
          </ElTooltip>
        </li>
        <li>
          <ElTooltip
            :content="t('admin.allMenus')"
            placement="bottom"
            :show-after="500"
          >
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-foreground"
              :class="showMenuDrawer ? 'bg-accent text-primary' : 'text-muted-foreground'"
              :aria-label="t('admin.allMenus')"
              @click="showMenuDrawer = !showMenuDrawer"
            >
              <AppIcon
                :name="showMenuDrawer ? 'expand' : 'menu'"
                class="size-4"
              />
            </button>
          </ElTooltip>
        </li>
        <li class="md:hidden">
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            :aria-label="t('admin.openFavorites')"
            @click="showMobileFavorites = true"
          >
            <AppIcon
              name="star-filled"
              class="size-4"
            />
          </button>
        </li>
        <li>
          <button
            type="button"
            class="max-w-40 cursor-pointer truncate px-1 text-base text-foreground"
            @click="showMenuDrawer = true"
          >
            {{ t('common.appName') }}
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
          <ElTooltip
            :content="t('admin.settings')"
            placement="bottom"
            :show-after="500"
          >
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              :aria-label="t('admin.settings')"
              @click="handleComingSoon"
            >
              <AppIcon
                name="setting"
                class="size-4"
              />
            </button>
          </ElTooltip>
        </li>
        <li>
          <ElDropdown
            trigger="click"
            @command="handleUserCommand"
          >
            <div class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {{ userInitial }}
              </span>
              <span class="hidden flex-col leading-tight sm:flex">
                <span class="flex items-center gap-1 text-xs text-foreground">
                  {{ userName }}
                  <span class="text-muted-foreground">{{ t('admin.roleAdmin') }}</span>
                </span>
                <span class="max-w-40 truncate text-[11px] text-muted-foreground">{{ auth.user?.email }}</span>
              </span>
              <AppIcon
                name="arrow-down"
                class="size-3 shrink-0 text-muted-foreground"
              />
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="profile">
                  {{ t('admin.profile') }}
                </ElDropdownItem>
                <ElDropdownItem command="password">
                  {{ t('admin.changePassword') }}
                </ElDropdownItem>
                <ElDropdownItem command="clearCache">
                  {{ t('admin.clearCache') }}
                </ElDropdownItem>
                <ElDropdownItem
                  divided
                  command="theme"
                >
                  <span class="flex items-center gap-2">
                    <AppIcon
                      :name="showDarkIcon ? 'sun' : 'moon'"
                      class="size-4"
                    />
                    {{ t('common.theme') }}：{{ showDarkIcon ? t('admin.themeDark') : t('admin.themeLight') }}
                  </span>
                </ElDropdownItem>
                <ElDropdownItem
                  v-for="item in localeItems"
                  :key="item.value"
                  :command="`locale:${item.value}`"
                >
                  <span class="flex items-center gap-2">
                    <AppIcon
                      v-if="locale === item.value"
                      name="check"
                      class="size-4 text-primary"
                    />
                    <span :class="locale === item.value ? 'text-primary' : ''">{{ item.label }}</span>
                  </span>
                </ElDropdownItem>
                <ElDropdownItem
                  divided
                  command="logout"
                >
                  <span class="flex items-center gap-2">
                    <AppIcon
                      name="switch-button"
                      class="size-4"
                    />
                    {{ t('common.logout') }}
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
        class="hidden shrink-0 flex-col border-r border-border bg-card/30 transition-[width] duration-200 md:flex"
        :class="favoritesCollapsed ? 'w-9' : 'w-[76px]'"
      >
        <button
          type="button"
          class="flex shrink-0 cursor-pointer items-center justify-center gap-0.5 py-2 text-[11px] text-muted-foreground transition-colors hover:text-primary"
          :class="favoritesCollapsed ? 'flex-col gap-2' : 'flex-row'"
          :aria-label="favoritesCollapsed ? t('admin.myFavorites') : t('admin.collapse')"
          @click="favoritesCollapsed = !favoritesCollapsed"
        >
          <span
            v-if="!favoritesCollapsed"
            class="leading-none"
          >{{ t('admin.collapse') }}</span>
          <AppIcon
            :name="favoritesCollapsed ? 'd-arrow-right' : 'd-arrow-left'"
            class="size-3.5 shrink-0"
          />
          <span
            v-if="favoritesCollapsed"
            class="text-[11px] leading-none tracking-widest [writing-mode:vertical-rl]"
          >{{ t('admin.myFavorites') }}</span>
        </button>
        <div
          v-if="!favoritesCollapsed"
          class="h-px shrink-0 bg-gradient-to-r from-transparent via-border to-transparent"
        />

        <AdminFavoriteMenus
          v-if="!favoritesCollapsed"
          @browse="showMenuDrawer = true"
        />
      </aside>

      <!-- 内容区 -->
      <main class="min-w-0 flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- 全部菜单抽屉 -->
    <AdminMenuDrawer v-model="showMenuDrawer" />

    <!-- 移动端收藏菜单 -->
    <ElDrawer
      v-model="showMobileFavorites"
      direction="ltr"
      size="72%"
    >
      <template #header>
        <span class="text-base font-semibold text-foreground">{{ t('admin.title') }}</span>
      </template>
      <AdminFavoriteMenus
        wide
        @select="showMobileFavorites = false"
        @browse="browseFromMobile"
      />
    </ElDrawer>
  </div>
</template>
