<script setup lang="ts">
type AuthPanelMode = 'left' | 'center' | 'right'

const { t, locale, setLocale } = useI18n()
const { locales } = useI18n()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

/** 认证面板形态：默认左侧表单 + 右侧 slogan；可切换居中或镜像 */
const authPanel = ref<AuthPanelMode>('left')
const authPanelLeft = computed(() => authPanel.value === 'left')
const authPanelRight = computed(() => authPanel.value === 'right')
const authPanelCenter = computed(() => authPanel.value === 'center')

const localeItems = computed(() =>
  locales.value.map(l => ({ label: l.name || l.code, value: l.code })),
)

// 必须通过 setLocale() 切换语言：语言包是按需懒加载的，
// 直接给 locale.value 赋值只会切换当前语言，不会加载对应语言包，导致 t() 回退显示 key
async function onLocaleChange(code: unknown) {
  const next = typeof code === 'string' ? code : undefined
  if (next && next !== locale.value) {
    await setLocale(next as typeof locale.value)
  }
}

function toggleTheme(): void {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

/* ============ 主题色（color）预设 ============ */
interface ColorPreset {
  light: { primary: string, hover: string, active: string, foreground: string }
  dark: { primary: string, hover: string, active: string, foreground: string }
}

const COLOR_PRESETS: Record<string, ColorPreset> = {
  violet: {
    light: { primary: '262 83% 58%', hover: '261 73% 53%', active: '262 83% 44%', foreground: '0 0% 98%' },
    dark: { primary: '262 83% 72%', hover: '261 90% 78%', active: '262 83% 62%', foreground: '240 10% 4%' },
  },
  blue: {
    light: { primary: '221 83% 53%', hover: '221 80% 47%', active: '222 86% 40%', foreground: '0 0% 100%' },
    dark: { primary: '217 91% 68%', hover: '216 90% 76%', active: '218 86% 58%', foreground: '222 40% 6%' },
  },
  green: {
    light: { primary: '152 76% 40%', hover: '152 78% 33%', active: '153 78% 27%', foreground: '0 0% 100%' },
    dark: { primary: '151 55% 58%', hover: '151 60% 66%', active: '152 58% 48%', foreground: '155 40% 6%' },
  },
  amber: {
    light: { primary: '38 92% 46%', hover: '37 90% 40%', active: '36 92% 32%', foreground: '40 60% 5%' },
    dark: { primary: '43 96% 62%', hover: '45 97% 70%', active: '42 95% 52%', foreground: '40 50% 8%' },
  },
  rose: {
    light: { primary: '350 89% 52%', hover: '351 82% 46%', active: '352 86% 38%', foreground: '0 0% 100%' },
    dark: { primary: '349 90% 70%', hover: '351 92% 76%', active: '350 92% 60%', foreground: '350 40% 8%' },
  },
  cyan: {
    light: { primary: '189 94% 40%', hover: '190 92% 33%', active: '191 95% 27%', foreground: '190 40% 6%' },
    dark: { primary: '188 86% 62%', hover: '190 90% 72%', active: '189 90% 52%', foreground: '190 40% 8%' },
  },
}

const colorKey = useCookie<string>('elsfs_auth_color', {
  default: () => 'violet',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

function applyColor(): void {
  if (!import.meta.client) return
  const preset = (COLOR_PRESETS[colorKey.value] ?? COLOR_PRESETS.violet)!
  const c = isDark.value ? preset.dark : preset.light
  const root = document.documentElement
  root.style.setProperty('--primary', c.primary)
  root.style.setProperty('--primary-hover', c.hover)
  root.style.setProperty('--primary-active', c.active)
  root.style.setProperty('--primary-foreground', c.foreground)
  root.style.setProperty('--ring', c.primary)
}

function switchColor(key: string): void {
  if (!COLOR_PRESETS[key]) return
  colorKey.value = key
  applyColor()
}

watch(colorKey, applyColor)
watch(isDark, applyColor)
onMounted(applyColor)

/** 布局切换（左 / 中 / 右） */
function switchPanel(mode: AuthPanelMode): void {
  authPanel.value = mode
}

const currentYear = new Date().getFullYear()
</script>

<template>
  <div
    class="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300 select-none"
  >
    <!-- 顶部工具栏（右上胶囊）：布局 / 语言 / 主题 -->
    <div
      class="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full border border-border/60 bg-accent/80 px-2 py-1.5 shadow-lg backdrop-blur-md"
    >
      <ElDropdown
        trigger="click"
        @command="switchPanel"
      >
        <ElButton
          circle
          text
          :aria-label="t('layoutMode.label')"
        >
          <AppIcon
            name="grid"
            class="size-4"
          />
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              :command="'left'"
              :disabled="authPanelLeft"
            >
              {{ t('layoutMode.left') }}
            </ElDropdownItem>
            <ElDropdownItem
              :command="'center'"
              :disabled="authPanelCenter"
            >
              {{ t('layoutMode.center') }}
            </ElDropdownItem>
            <ElDropdownItem
              :command="'right'"
              :disabled="authPanelRight"
            >
              {{ t('layoutMode.right') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <span class="mx-1 h-4 w-px bg-border" />

      <!-- 主题色（color） -->
      <ElDropdown
        trigger="click"
        @command="switchColor"
      >
        <ElButton
          circle
          text
          :aria-label="t('toolbar.color')"
        >
          <AppIcon
            name="brush"
            class="size-4"
          />
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="(preset, key) in COLOR_PRESETS"
              :key="key"
              :command="key"
            >
              <span class="flex items-center">
                <span
                  class="mr-2 size-4 rounded-full ring-1 ring-inset ring-black/10"
                  :style="{ backgroundColor: `hsl(${preset.light.primary})` }"
                />
                {{ t(`toolbar.colors.${key}`) }}
                <AppIcon
                  v-if="colorKey === key"
                  name="check"
                  class="ml-2 size-3.5 text-primary"
                />
              </span>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <ElDropdown
        trigger="click"
        @command="onLocaleChange"
      >
        <ElButton
          circle
          text
          :aria-label="t('common.language')"
        >
          <AppIcon
            name="message"
            class="size-4"
          />
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="item in localeItems"
              :key="item.value"
              :command="item.value"
            >
              <span :class="{ 'text-primary': locale === item.value }">
                {{ item.label }}
              </span>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <ElButton
        circle
        text
        :aria-label="t('common.theme')"
        @click="toggleTheme"
      >
        <AppIcon
          :name="isDark ? 'sun' : 'moon'"
          class="size-4"
        />
      </ElButton>
    </div>

    <!-- 左侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelLeft"
      class="w-full lg:w-2/5"
      data-side="left"
    >
      <template #default>
        <slot />
      </template>
      <template #copyright>
        <div class="text-muted-foreground">
          © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
        </div>
      </template>
    </AuthenticationFormView>

    <!-- Logo -->
    <slot name="logo">
      <div
        class="absolute top-0 left-0 z-10 flex cursor-pointer"
        @click="switchPanel('left')"
      >
        <div class="mt-4 ml-4 flex items-center text-foreground sm:top-6 sm:left-6">
          <div class="mr-2.5 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <AppIcon
              name="medal"
              class="size-5"
            />
          </div>
          <p class="m-0 text-xl font-semibold">
            {{ t('common.appName') }}
          </p>
        </div>
      </div>
    </slot>

    <!-- 系统介绍（slogan 大图区：left 模式在右、right 模式在左） -->
    <div
      v-if="!authPanelCenter"
      class="relative hidden w-0 flex-1 lg:block"
      :class="authPanelRight ? 'lg:order-first' : ''"
    >
      <div class="absolute inset-0 size-full bg-background-deep dark:bg-[#070709]">
        <div class="login-background absolute inset-0" />
        <div class="relative flex size-full flex-col items-center justify-center px-8">
          <div class="flex h-40 w-64 items-center justify-center opacity-90">
            <AppIcon
              name="lucide--shield-check"
              class="size-28 text-primary drop-shadow-2xl"
            />
          </div>
          <h1 class="mt-6 text-center text-2xl font-semibold text-foreground lg:text-3xl">
            {{ t('common.brandTagline') }}
          </h1>
          <p class="mt-3 max-w-md text-center text-sm text-muted-foreground lg:text-base">
            {{ t('common.brandDescription') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 右侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelRight"
      class="w-full lg:w-2/5"
      data-side="right"
    >
      <template #default>
        <slot />
      </template>
      <template #copyright>
        <div class="text-muted-foreground">
          © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
        </div>
      </template>
    </AuthenticationFormView>

    <!-- 居中认证面板 -->
    <div
      v-if="authPanelCenter"
      class="relative flex w-full flex-1 items-center justify-center"
    >
      <div class="login-background absolute inset-0" />
      <AuthenticationFormView
        class="w-full pb-16 shadow-float shadow-primary/5 md:w-2/3 md:rounded-3xl lg:w-1/2 xl:w-[36%]"
        data-side="bottom"
      >
        <template #default>
          <slot />
        </template>
        <template #copyright>
          <div class="text-muted-foreground">
            © {{ currentYear }} {{ t('common.appName') }} · {{ t('common.rights') }}
          </div>
        </template>
      </AuthenticationFormView>
    </div>
  </div>
</template>

<style>
/* ================= 认证表单：大气清晰的输入/按钮样式 =================
 * 作用于认证页面根容器 .auth-form，放大输入框、柔和边框与聚焦高亮。
 */
.auth-form .el-input__wrapper {
  min-height: 48px;
  border-radius: 10px;
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: box-shadow 0.2s ease;
}

.auth-form .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
}

.auth-form .el-input__wrapper.is-focus {
  box-shadow:
    0 0 0 1px var(--el-color-primary) inset,
    0 0 0 3px rgb(var(--el-color-primary-rgb) / 0.15);
}

.auth-form .el-input__inner {
  font-size: 15px;
}

.auth-form .el-input__prefix,
.auth-form .el-input__suffix {
  color: var(--el-text-color-placeholder);
}

/* 输入错误态 */
.auth-form .el-input.is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

/* 记住我 / 忘记密码 / 登录入口按钮字体一致 */
.auth-form .el-checkbox__label {
  font-size: 14px;
}

/* 顶部标签：清晰小号 */
.auth-form .el-form-item__label {
  height: auto;
  margin-bottom: 6px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  padding: 0;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-form .el-form-item:last-of-type {
  margin-bottom: 24px;
}

/* 字段内容错误文字 */
.auth-form .el-form-item__error {
  padding-top: 4px;
  font-size: 12px;
}

/* 提交按钮：更宽更高、主色背景 */
.auth-form .auth-submit {
  height: 48px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
}

/* ================= 认证页专用：封面面板背景光斑 ================= */
.login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 24%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}

.dark .login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 18%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}
</style>
