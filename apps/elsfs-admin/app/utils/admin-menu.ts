import type { BackendMenu } from 'api-types/elsfs'

import type { AdminMenuLeaf, AdminMenuItem } from '~/types/menu'

/** 把后端节点抹平成内部节点：id / title / 排序 */
function normalizeNode(node: BackendMenu): AdminMenuItem {
  const meta = node.meta ?? {}
  const title = meta.title ?? node.name ?? node.path ?? ''
  // 真实接口的 id 在顶层，兼容后端把 id 放在 meta.id 的情况
  const id = node.id ?? meta.id ?? node.name ?? node.path ?? title

  return {
    id,
    title,
    icon: meta.icon,
    path: node.path,
    redirect: node.redirect,
    meta,
    children: node.children?.length ? normalizeAdminMenus(node.children) : undefined,
  }
}

/**
 * 规范化后端菜单：按 `meta.order` 排序（没有 order 的当 0），并递归处理 children。
 * 后端换成真实接口后直接喂这个函数即可。
 */
export function normalizeAdminMenus(list: BackendMenu[]): AdminMenuItem[] {
  return [...list]
    .toSorted((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0))
    .map(normalizeNode)
}

/**
 * 展平出所有叶子菜单（最深层、可点击可收藏的项），
 * 同时带上所属一级菜单（子系统）与二级分组的信息。
 */
export function flattenMenuTree(list: AdminMenuItem[]): AdminMenuLeaf[] {
  const leaves: AdminMenuLeaf[] = []

  function walk(nodes: AdminMenuItem[], root: AdminMenuItem, group?: AdminMenuItem): void {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children, root, group ?? node)
        continue
      }
      leaves.push({
        ...node,
        rootId: root.id,
        rootTitle: root.title,
        rootIcon: root.icon,
        groupId: group?.id,
        groupTitle: group?.title,
      })
    }
  }

  for (const root of list) {
    if (root.children?.length) {
      walk(root.children, root)
      continue
    }
    leaves.push({ ...root, rootId: root.id, rootTitle: root.title, rootIcon: root.icon })
  }

  return leaves
}

/** 统计一棵菜单树里的叶子菜单数量 */
export function countMenuLeaves(list: AdminMenuItem[]): number {
  return list.reduce(
    (total, item) => total + (item.children?.length ? countMenuLeaves(item.children) : 1),
    0,
  )
}

/**
 * 菜单图标方块配色：按一级菜单 id 稳定分配（换页 / 重新收藏都保持同色）。
 * 类名必须写成字面量，Tailwind 才能扫描到；亮度分开写，暗色下用 400/20 底 + 300 前景。
 */
const MENU_TILE_CLASSES: Record<string, string> = {
  dashboard: 'bg-sky-500/15 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300',
  system: 'bg-violet-500/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300',
  content: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300',
  goods: 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300',
  order: 'bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300',
  marketing: 'bg-cyan-500/15 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300',
  finance: 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300',
  report: 'bg-teal-500/15 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300',
  dev: 'bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300',
}

/** 方形图标块的底色：分类没登记时回落到中性色 */
export function menuTileClass(categoryId?: string): string {
  return (
    (categoryId ? MENU_TILE_CLASSES[categoryId] : undefined) ?? 'bg-muted text-muted-foreground'
  )
}

/** 菜单地址：没有真实页面时统一落到占位页（真实路由判断在 `useMenuPath` 里） */
export function fallbackMenuPath(item: AdminMenuItem): string {
  return `/menu/${item.id}`
}

/**
 * 按关键字递归过滤菜单树（层级不限）。
 * 某一级名称命中时保留它的整棵子树，否则只保留命中的子级；整棵都没命中就丢弃。
 * 标题可能是 i18n key，所以这里额外接受一个「取显示名」的函数。
 */
export function filterMenuTree(
  list: AdminMenuItem[],
  keyword: string,
  toDisplay: (title: string) => string = (title) => title,
): AdminMenuItem[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) {
    return list
  }

  return list
    .map((item) => {
      if (toDisplay(item.title).toLowerCase().includes(kw)) {
        return item
      }
      const children = item.children ?? []
      if (!children.length) {
        return null
      }
      const matched = filterMenuTree(children, kw, toDisplay)
      return matched.length ? { ...item, children: matched } : null
    })
    .filter((item): item is AdminMenuItem => item !== null)
}
