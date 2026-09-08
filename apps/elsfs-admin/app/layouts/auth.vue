<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const { locales } = useI18n()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

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

// vue-i18n v11 中 tm() 返回编译后的消息 AST，因此数组消息改为按索引翻译
const featureKeys = ['common.features.0', 'common.features.1', 'common.features.2']
const features = computed(() => featureKeys.map(key => t(key)))

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
    <!-- 环境光背景：柔和渐变 + 光斑 + 微网格纹理 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10"
    >
      <!-- 全局渐变底色 -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50/90 via-slate-50 to-secondary-50/60 dark:from-primary-950/40 dark:via-slate-950 dark:to-secondary-950/40" />
      <!-- 光斑 -->
      <div class="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary-400/25 blur-3xl animate-blob" />
      <div class="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-secondary-400/20 blur-3xl animate-blob [animation-delay:4s]" />
      <div class="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl animate-blob [animation-delay:8s]" />
      <!-- 微网格纹理 -->
      <div class="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>

    <div class="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
      <!-- 左侧品牌区（移动端隐藏） -->
      <aside class="hidden flex-col justify-between gap-12 p-12 lg:flex xl:p-16">
        <!-- Logo -->
        <div class="flex items-center gap-3.5">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25">
            <ElIcon
              name="i-lucide-shield-check"
              class="size-6 text-white"
            />
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{{ t('common.appName') }}</span>
        </div>

        <!-- 品牌主张 -->
        <div class="max-w-md space-y-6">
          <div class="space-y-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              {{ t('common.eyebrow') }}
            </p>
            <h1 class="text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 dark:text-white xl:text-[2.75rem]">
              {{ t('common.brandTagline') }}
            </h1>
            <p class="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {{ t('common.brandDescription') }}
            </p>
          </div>

          <ul class="space-y-3.5">
            <li
              v-for="feature in features"
              :key="feature"
              class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400">
                <ElIcon
                  name="i-lucide-circle-check"
                  class="size-4"
                />
              </span>
              {{ feature }}
            </li>
          </ul>
        </div>

        <!-- 页脚 -->
        <div class="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
          <ElIcon
            name="i-lucide-shield"
            class="size-3.5"
          />
          <span>© {{ new Date().getFullYear() }} {{ t('common.appName') }} · {{ t('common.rights') }}</span>
        </div>
      </aside>

      <!-- 右侧表单区 -->
      <main class="flex items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div class="w-full max-w-md">
          <!-- 移动端品牌头 -->
          <div class="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25">
              <ElIcon
                name="i-lucide-shield-check"
                class="size-6 text-white"
              />
            </div>
            <div class="text-center">
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ t('common.appName') }}
              </h1>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ t('common.brandTagline') }}
              </p>
            </div>
          </div>

          <!-- 顶部工具条：语言切换 + 主题切换 -->
          <div class="mb-6 flex items-center justify-end gap-2">
            <ElSelect
              :model-value="locale"
              :items="localeItems"
              class="w-32"
              :aria-label="t('common.language')"
              @update:model-value="onLocaleChange"
            />
            <ElButton
              variant="ghost"
              square
              :aria-label="t('common.theme')"
              @click="toggleTheme"
            >
              <template #leading>
                <ElIcon
                  :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
                  class="size-4"
                />
              </template>
            </ElButton>
          </div>

          <!-- 毛玻璃卡片 -->
          <div class="animate-fade-in relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/75 p-8 shadow-2xl shadow-slate-900/[0.06] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-10">
            <!-- 卡片顶部高光 -->
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/15"
            />
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
