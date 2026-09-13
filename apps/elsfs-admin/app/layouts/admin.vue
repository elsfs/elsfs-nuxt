<script setup lang="ts">
/**
 * 后台外壳布局。
 *
 * 结构：顶栏（左上角是「全部菜单」入口）+ 左侧收藏菜单栏 + 右侧内容区。
 * 收藏数据来自 `useMenuStore`，抽屉组件见 `AdminMenuDrawer`。
 */
const { t, locale, locales, setLocale } = useI18n()

const menuStore = useMenuStore()
const auth = useAuthStore()
const router = useRouter()

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

/* ---------- 主题 ---------- */
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

/**
 * 服务端拿不到系统主题偏好（color-mode 默认存 localStorage），
 * 直接按 isDark 渲染图标会造成 hydration 不一致，挂载完成后再切换。
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
const userInitial = computed(() => (auth.user?.email?.[0] ?? 'U').toUpperCase())

async function handleUserCommand(command: string): Promise<void> {
  if (command !== 'logout') {
    return
  }
  await auth.logout()
  await router.push('/auth/login')
}

function browseFromMobile(): void {
  showMobileFavorites.value = false
  showMenuDrawer.value = true
}
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- 顶栏 -->
    <header class="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/60 px-3 sm:px-4">
      <!-- 左上角：打开全部菜单 -->
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        @click="showMenuDrawer = true"
      >
        <AppIcon
          name="grid"
          class="size-4"
        />
        <span class="hidden sm:inline">{{ t('admin.allMenus') }}</span>
      </button>

      <!-- 移动端：打开收藏菜单 -->
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent md:hidden"
        :aria-label="t('admin.openFavorites')"
        @click="showMobileFavorites = true"
      >
        <AppIcon
          name="star-filled"
          class="size-4"
        />
      </button>

      <div class="ml-1 flex min-w-0 items-center gap-2">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <AppIcon
            name="medal"
            class="size-4"
          />
        </span>
        <span class="truncate text-sm font-semibold">{{ t('admin.title') }}</span>
      </div>

      <div class="ml-auto flex items-center gap-1 sm:gap-2">
        <span class="hidden text-xs text-muted-foreground lg:inline">
          {{ t('admin.favoriteCount', { count: menuStore.favoriteCount }) }}
        </span>

        <!-- 主题 -->
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          :aria-label="t('common.theme')"
          @click="toggleTheme"
        >
          <AppIcon
            :name="showDarkIcon ? 'sun' : 'moon'"
            class="size-4"
          />
        </button>

        <!-- 语言 -->
        <ElDropdown
          trigger="click"
          @command="switchLocale"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            :aria-label="t('common.language')"
          >
            <AppIcon
              name="message"
              class="size-4"
            />
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="item in localeItems"
                :key="item.value"
                :command="item.value"
              >
                <span :class="{ 'text-primary': locale === item.value }">{{ item.label }}</span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <!-- 用户 -->
        <ElDropdown
          trigger="click"
          @command="handleUserCommand"
        >
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-accent"
          >
            <span class="flex size-6 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
              {{ userInitial }}
            </span>
            <span
              v-if="auth.user"
              class="hidden max-w-32 truncate text-xs text-muted-foreground sm:inline"
            >{{ auth.user.email }}</span>
            <AppIcon
              name="arrow-down"
              class="size-3 text-muted-foreground"
            />
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="logout">
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
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <!-- 左侧：收藏夹（参考 xjx-onehip-frontend，窄栏 + 可收起） -->
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
