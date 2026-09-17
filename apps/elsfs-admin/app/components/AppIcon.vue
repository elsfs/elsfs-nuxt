<script setup lang="ts">
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { Component, VNode } from 'vue'

import { resolveIconifyIcon } from '~/utils/iconify'

export interface IconProps {
  /**
   * 图标名，支持三种来源：
   * - iconify 名：`mdi:home`、`mdi--home`、`icon-[mdi--home]`、`i-lucide-shield-check`
   *   （本地装了 @iconify-json/mdi 与 @iconify-json/lucide，直接渲染 SVG；
   *    其他图标集需先安装对应 @iconify-json 或登记进 ICONIFY_CLASSES）
   * - element-plus 图标：`message`、`circle-check`、`medal`（大小写不敏感）
   */
  name: string
  /**
   * 图标来源，默认依据图标名格式自动识别：
   * - `auto` 默认：含 `--`/`:` 或 `icon-[` 前缀视为 iconify，否则视为 element-plus
   * - `iconify`：强制按 iconify 处理
   * - `element-plus`：强制按 element-plus 图标处理
   */
  provider?: 'auto' | 'iconify' | 'element-plus'
  /** 兜底图标（Element Plus 短名）：图标集没装 / 名字不认识时显示它 */
  fallback?: string
}

const props = defineProps<IconProps>()

/**
 * 组件有多个根节点分支（ep / iconify 类名 / 本地 SVG），
 * 默认的 attrs 透传在 SSR 与客户端表现不一致（会报 hydration class mismatch），
 * 所以关掉自动透传，下面三个分支各自显式 v-bind。
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
/** 除 class 之外的属性（含事件监听），class 各分支单独合并 */
const iconAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

/* ------------------------------------------------------------------ *
 * iconify 图标类名登记
 *
 * @iconify/tailwind4 依赖 Tailwind v4 扫描源码中的「字面类名」来生成图标
 * CSS（mask + --svg）。运行时拼接的类名无法被扫描到，因此所有 iconify
 * 图标要么在使用处直接写完整类名 `icon-[...]`，要么在此处以字面量登记。
 * 新增 iconify 图标时，在 ICONIFY_CLASSES 中追加一行即可。
 * ------------------------------------------------------------------ */
const ICONIFY_CLASSES: Record<string, string> = {
  // lucide（图标集来自 @iconify-json/lucide）
  'lucide--shield-check': 'icon-[lucide--shield-check]',
  'lucide--circle-check': 'icon-[lucide--circle-check]',
  'lucide--shield': 'icon-[lucide--shield]',
  'lucide--sun': 'icon-[lucide--sun]',
  'lucide--moon': 'icon-[lucide--moon]',
  'lucide--mail': 'icon-[lucide--mail]',
  'lucide--lock': 'icon-[lucide--lock]',
  'lucide--eye': 'icon-[lucide--eye]',
  'lucide--eye-off': 'icon-[lucide--eye-off]',
  'lucide--rotate-ccw': 'icon-[lucide--rotate-ccw]',
  'lucide--user': 'icon-[lucide--user]',
  'lucide--gauge': 'icon-[lucide--gauge]',
  'lucide--lock-keyhole': 'icon-[lucide--lock-keyhole]',
  'lucide--log-out': 'icon-[lucide--log-out]',
  'lucide--circle-alert': 'icon-[lucide--circle-alert]',
  // mdi（图标集来自 @iconify-json/mdi，tailwind-config layer 提供）
  'mdi--home': 'icon-[mdi--home]',
  'mdi--account': 'icon-[mdi--account]',
  'mdi--settings': 'icon-[mdi--settings]',
  'mdi--heart': 'icon-[mdi--heart]',
  'mdi--check-circle': 'icon-[mdi--check-circle]',
}

/** 兼容旧写法：`i-lucide-shield-check` → `icon-[lucide--shield-check]` */
const ICONIFY_SHORTHAND = /^i-([a-z0-9]+)-(.+)$/

function toPascalCase(input: string): string {
  return input
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

/** 将简化 iconify 名（mdi--home / mdi:home / i-lucide-home）转换为完整类名 */
function toIconifyClass(raw: string): string | undefined {
  // 已经是完整类名
  if (raw.startsWith('icon-[')) {
    return raw
  }
  // 查登记表
  if (ICONIFY_CLASSES[raw]) {
    return ICONIFY_CLASSES[raw]
  }
  // iconify 官方格式 prefix--name / prefix:name
  const sep = raw.includes('--') ? '--' : raw.includes(':') ? ':' : null
  if (sep) {
    const [prefix, ...rest] = raw.split(sep)
    const icon = rest.join('--')
    if (prefix && icon) {
      return `icon-[${prefix}--${icon}]`
    }
  }
  // 旧写法 i-prefix-icon
  const shorthand = raw.match(ICONIFY_SHORTHAND)
  if (shorthand) {
    return `icon-[${shorthand[1]}--${shorthand[2]}]`
  }
  return undefined
}

/** 按 Element Plus 短名取图标组件 */
function toElementPlusIcon(name: string): Component | VNode | undefined {
  const pascal = toPascalCase(name.replace(/^(ElIcon|el-icon)/i, ''))
  return (ElementPlusIcons as unknown as Record<string, Component | VNode | undefined>)[pascal]
}

/**
 * 是否走「Tailwind 图标类」这条路。
 * 只有字面类名 `icon-[...]`、登记表里的名字、以及旧写法 `i-prefix-name` 才行——
 * 后端运行时下发的 `ic:xxx` 这类名字 Tailwind 根本扫不到，必须走兜底图标。
 */
function isRegisteredIconify(raw: string): boolean {
  return raw.startsWith('icon-[') || Boolean(ICONIFY_CLASSES[raw]) || ICONIFY_SHORTHAND.test(raw)
}

const resolved = computed(() => {
  const raw = props.name.trim()
  const provider = props.provider || 'auto'
  const looksIconify =
    provider !== 'element-plus' &&
    (provider === 'iconify' || raw.startsWith('icon-[') || raw.includes('--') || raw.includes(':'))

  // 1) 本地装了的 iconify 图标集：直接渲染 SVG（后端菜单下发的 mdi:xxx 走这里）
  if (looksIconify) {
    const icon = resolveIconifyIcon(raw)
    if (icon) {
      return { kind: 'svg' as const, ...icon }
    }
  } else {
    // 2) Element Plus 图标
    const component = toElementPlusIcon(raw)
    if (component) {
      return { kind: 'ep' as const, component }
    }
  }

  // 3) 字面 / 登记过的 iconify 类名（Tailwind 能扫到的那些）
  if (isRegisteredIconify(raw)) {
    const iconClass = toIconifyClass(raw)
    if (iconClass) {
      return { kind: 'iconify' as const, iconClass }
    }
  }

  // 4) 兜底图标：图标集没装或名字不认识时别留空
  const fallback = toElementPlusIcon(props.fallback ?? '')
  if (fallback) {
    return { kind: 'ep' as const, component: fallback }
  }

  return { kind: 'empty' as const }
})
</script>

<template>
  <component
    :is="resolved.component"
    v-if="resolved.kind === 'ep'"
    v-bind="iconAttrs"
    :class="attrs.class"
  />
  <i
    v-else-if="resolved.kind === 'iconify' && resolved.iconClass"
    v-bind="iconAttrs"
    :class="[resolved.iconClass, attrs.class]"
    aria-hidden="true"
  />
  <!-- 图标 body 来自随包安装的 @iconify-json/xxx（构建期常量，不是用户输入） -->
  <!-- eslint-disable vue/no-v-html -->
  <svg
    v-else-if="resolved.kind === 'svg'"
    v-bind="iconAttrs"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${resolved.width} ${resolved.height}`"
    :class="attrs.class"
    width="1em"
    height="1em"
    aria-hidden="true"
    v-html="resolved.body"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>
