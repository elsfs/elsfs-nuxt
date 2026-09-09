<script setup lang="ts">
type ToolbarType = 'color' | 'language' | 'layout' | 'theme'

type AuthPanelMode = 'left' | 'center' | 'right'

interface Props {
  toolbarList?: ToolbarType[]
  panel?: AuthPanelMode
}

defineOptions({ name: 'AuthToolbar' })

const props = withDefaults(defineProps<Props>(), {
  toolbarList: () => ['color', 'language', 'layout', 'theme'],
  panel: 'left',
})

const emit = defineEmits<{ 'change-panel': [mode: AuthPanelMode] }>()

const showColor = computed(() => props.toolbarList.includes('color'))
const showLayout = computed(() => props.toolbarList.includes('layout'))
const showLanguage = computed(() => props.toolbarList.includes('language'))
const showTheme = computed(() => props.toolbarList.includes('theme'))

/* ---------- i18n ---------- */
const { t, locale, setLocale } = useI18n()
const { locales } = useI18n()

const localeItems = computed(() =>
  locales.value.map(l => ({ label: l.name || l.code, value: l.code })),
)

async function switchLocale(code: string): Promise<void> {
  if (code && code !== locale.value) {
    await setLocale(code as typeof locale.value)
  }
}

/* ---------- 主题色 ---------- */
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

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
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

/* ---------- 主题 ---------- */
function toggleTheme(): void {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

watch(colorKey, applyColor)
watch(isDark, applyColor)
onMounted(applyColor)

/* ---------- 布局 ---------- */
function switchPanel(mode: AuthPanelMode): void {
  emit('change-panel', mode)
}
</script>

<template>
  <div
    :class="{
      'rounded-3xl bg-accent px-3 py-1': toolbarList.length > 1,
    }"
    class="absolute top-4 right-2 z-10 flex-center"
  >
    <!-- color + layout：仅 md 及以上显示 -->
    <div class="hidden items-center md:flex">
      <ElDropdown
        v-if="showColor"
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
        v-if="showLayout"
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
              command="left"
              :disabled="panel === 'left'"
            >
              {{ t('layoutMode.left') }}
            </ElDropdownItem>
            <ElDropdownItem
              command="center"
              :disabled="panel === 'center'"
            >
              {{ t('layoutMode.center') }}
            </ElDropdownItem>
            <ElDropdownItem
              command="right"
              :disabled="panel === 'right'"
            >
              {{ t('layoutMode.right') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>

    <!-- 语言：常显 -->
    <ElDropdown
      v-if="showLanguage"
      trigger="click"
      @command="switchLocale"
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

    <!-- 主题：常显 -->
    <ElButton
      v-if="showTheme"
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
</template>
