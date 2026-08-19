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
  <div class="relative min-h-screen overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
    <!-- 环境光背景装饰（毛玻璃氛围） -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div class="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary-400/30 blur-3xl animate-blob" />
      <div class="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-secondary-400/20 blur-3xl animate-blob [animation-delay:2s]" />
      <div class="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl animate-blob [animation-delay:4s]" />
    </div>

    <div class="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
      <!-- 左侧品牌区（移动端隐藏） -->
      <aside class="hidden flex-col justify-between gap-12 p-12 lg:flex">
        <div class="flex items-center gap-3">
          <UAvatar
            icon="i-lucide-shield-check"
            size="lg"
          />
          <span class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{{ t('common.appName') }}</span>
        </div>

        <div class="space-y-8">
          <h1 class="text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            {{ t('common.brandTagline') }}
          </h1>
          <p class="max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {{ t('common.brandDescription') }}
          </p>
          <ul class="space-y-3">
            <li
              v-for="feature in features"
              :key="feature"
              class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-5 shrink-0 text-primary-500"
              />
              {{ feature }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-slate-400 dark:text-slate-500">
          © {{ new Date().getFullYear() }} {{ t('common.appName') }}
        </p>
      </aside>

      <!-- 右侧表单区 -->
      <main class="flex items-center justify-center px-4 py-10 sm:px-8">
        <div class="w-full max-w-md">
          <!-- 移动端品牌头 -->
          <div class="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <UAvatar
              icon="i-lucide-shield-check"
              size="xl"
            />
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">
              {{ t('common.appName') }}
            </h1>
          </div>

          <!-- 顶部工具条：语言切换 + 主题切换 -->
          <div class="mb-6 flex items-center justify-end gap-2">
            <USelect
              :model-value="locale"
              :items="localeItems"
              size="sm"
              class="w-32"
              :aria-label="t('common.language')"
              @update:model-value="onLocaleChange"
            />
            <UButton
              variant="ghost"
              square
              :aria-label="t('common.theme')"
              @click="toggleTheme"
            >
              <template #leading>
                <UIcon
                  :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
                  class="size-4"
                />
              </template>
            </UButton>
          </div>

          <!-- 毛玻璃卡片 -->
          <div class="animate-fade-in rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/20 sm:p-10">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
