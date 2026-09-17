import lucideIcons from '@iconify-json/lucide/icons.json'
import mdiIcons from '@iconify-json/mdi/icons.json'

/**
 * 本地 iconify 图标查询。
 *
 * 后端菜单下发的图标是运行时的 iconify 名（如 `mdi:cloud-key-outline`），
 * Tailwind 扫不到这种动态类名，所以这里直接从随包安装的图标集 JSON 里取 SVG body，
 * 由 `AppIcon` 用 `<svg v-html>` 渲染，不依赖 Tailwind 生成类名。
 *
 * 只登记了应用里实际安装的图标集；后端给了没装的图标集（如 `ic:`）时返回 undefined，
 * 由 `AppIcon` 回落到 Element Plus 兜底图标。要支持新图标集就 `pnpm add @iconify-json/<prefix>` 并在这里补一行。
 */
interface IconifyIconData {
  /** 图标 SVG body；别名可能只有 parent，没有自己的 body */
  body?: string
  width?: number
  height?: number
  parent?: string
}

interface IconifyCollection {
  prefix: string
  width?: number
  height?: number
  icons: Record<string, IconifyIconData>
  aliases?: Record<string, IconifyIconData>
}

const COLLECTIONS: Record<string, IconifyCollection> = {
  mdi: mdiIcons as IconifyCollection,
  lucide: lucideIcons as IconifyCollection,
}

export interface ResolvedIconifyIcon {
  body: string
  width: number
  height: number
}

/** 别名可能指向别名，链式解析几层（带深度保护） */
function resolveAlias(
  collection: IconifyCollection,
  name: string,
  depth = 0,
): IconifyIconData | undefined {
  if (depth > 5) {
    return undefined
  }
  const alias = collection.aliases?.[name]
  if (!alias) {
    return undefined
  }
  if (alias.body) {
    return alias
  }
  const parent = alias.parent ?? ''
  return collection.icons[parent] ?? resolveAlias(collection, parent, depth + 1)
}

/** 解析 `mdi:home` / `mdi--home` / `icon-[mdi--home]`，命中本地图标集时返回 SVG */
export function resolveIconifyIcon(raw: string): ResolvedIconifyIcon | undefined {
  const name = raw.trim().replace(/^icon-\[(.+)\]$/, '$1')
  const separator = name.includes('--') ? '--' : name.includes(':') ? ':' : ''
  if (!separator) {
    return undefined
  }

  const [prefix, ...rest] = name.split(separator)
  const iconName = rest.join('-')
  if (!prefix || !iconName) {
    return undefined
  }

  const collection = COLLECTIONS[prefix]
  if (!collection) {
    return undefined
  }

  const icon = collection.icons[iconName] ?? resolveAlias(collection, iconName)
  if (!icon?.body) {
    return undefined
  }

  return {
    body: icon.body,
    width: icon.width ?? collection.width ?? 24,
    height: icon.height ?? collection.height ?? 24,
  }
}
