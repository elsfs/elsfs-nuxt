import type { AppMenuGroup, AppMenuLeaf } from '~/types/menu'
import { ADMIN_MENU, flattenMenuTree } from '~/utils/admin-menu'

/**
 * 默认收藏：只在 cookie 不存在时生效。
 * 用户把收藏清空后 cookie 会写入 `[]`，不会再被打回默认值。
 */
const DEFAULT_FAVORITES = ['dashboard-workbench', 'system-user', 'order-list']

/**
 * 后台菜单状态：菜单树 + 用户收藏。
 *
 * 收藏用 cookie 持久化（SSR 安全，刷新 / 换标签页都不丢），
 * 只存 id，菜单名称等展示信息始终从菜单树解析。
 */
export const useMenuStore = defineStore('menu', () => {
  const menus = ref(ADMIN_MENU)

  const favoriteCookie = useCookie<string[] | null>('elsfs_menu_favorites', {
    default: () => [...DEFAULT_FAVORITES],
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  /**
   * 收藏 id 列表。
   * useCookie 的 watch 会在浏览器里 cookie 被清掉（清站点数据 / 过期）时把值置成
   * null，这里统一兜底，避免下游 `.map` 直接抛错。
   */
  const favoriteIds = computed<string[]>(() =>
    Array.isArray(favoriteCookie.value) ? favoriteCookie.value : [...DEFAULT_FAVORITES],
  )

  function setFavoriteIds(ids: string[]): void {
    favoriteCookie.value = ids
  }

  /** 所有叶子菜单（可收藏项） */
  const leaves = computed(() => flattenMenuTree(menus.value))
  const leafMap = computed(() => new Map(leaves.value.map(leaf => [leaf.id, leaf])))

  /** 收藏项，顺序与收藏时间一致 */
  const favorites = computed<AppMenuLeaf[]>(() =>
    favoriteIds.value
      .map(id => leafMap.value.get(id))
      .filter((leaf): leaf is AppMenuLeaf => Boolean(leaf)),
  )

  const favoriteCount = computed(() => favorites.value.length)

  /** 收藏按一级菜单分组，左侧栏展示更清晰 */
  const favoriteGroups = computed<AppMenuGroup[]>(() => {
    const groups: AppMenuGroup[] = []
    for (const leaf of favorites.value) {
      const group = groups.find(item => item.id === leaf.parentId)
      if (group) {
        group.items.push(leaf)
        continue
      }
      groups.push({
        id: leaf.parentId,
        name: leaf.parentName,
        icon: leaf.parentIcon,
        items: [leaf],
      })
    }
    return groups
  })

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: string): void {
    setFavoriteIds(isFavorite(id)
      ? favoriteIds.value.filter(item => item !== id)
      : [...favoriteIds.value, id])
  }

  function removeFavorite(id: string): void {
    setFavoriteIds(favoriteIds.value.filter(item => item !== id))
  }

  function clearFavorites(): void {
    setFavoriteIds([])
  }

  return {
    menus,
    favoriteIds,
    leaves,
    leafMap,
    favorites,
    favoriteGroups,
    favoriteCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  }
})
