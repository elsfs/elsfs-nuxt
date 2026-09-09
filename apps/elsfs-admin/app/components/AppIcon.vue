<script setup lang="ts">
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { Component, VNode } from 'vue'

export interface IconProps {
  /**
   * 图标名，支持三种来源：
   * - iconify 完整类名：`icon-[mdi--home]`（推荐，Tailwind 可直接扫描到）
   * - iconify 简化名：`mdi--home`、`mdi:home`、`i-lucide-shield-check`
   *   （需在下方 ICONIFY_CLASSES / ICONIFY_PATTERNS 中登记，Tailwind 才能生成图标 CSS）
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
}

const props = defineProps<IconProps>()

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
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
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

const resolved = computed(() => {
  const raw = props.name.trim()
  const provider = props.provider || 'auto'
  const looksIconify = provider !== 'element-plus' && (provider === 'iconify' || raw.startsWith('icon-[') || raw.includes('--') || raw.includes(':'))

  // element-plus 图标：渲染对应的组件
  if (!looksIconify) {
    const pascal = toPascalCase(raw.replace(/^(ElIcon|el-icon)/i, ''))
    const component = (ElementPlusIcons as unknown as Record<string, Component | VNode | undefined>)[pascal]
    if (component) {
      return { kind: 'ep' as const, component }
    }
  }

  // iconify 图标：渲染 <i class="icon-[...]">
  return { kind: 'iconify' as const, iconClass: toIconifyClass(raw) }
})
</script>

<template>
  <component
    :is="resolved.component"
    v-if="resolved.kind === 'ep'"
  />
  <i
    v-else-if="resolved.kind === 'iconify' && resolved.iconClass"
    :class="resolved.iconClass"
    aria-hidden="true"
  />
</template>
