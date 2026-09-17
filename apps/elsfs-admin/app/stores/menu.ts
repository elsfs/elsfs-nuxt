import { fetchUserMenusApi } from '~/api/auth'
import { useApi } from '~/composables/useApi'
import type { AdminMenuLeaf, AdminMenuItem } from '~/types/menu'
import { ADMIN_MENU_RAW, flattenMenuTree, normalizeAdminMenus } from '~/utils/admin-menu'

/**
 * 默认收藏：只在 cookie 不存在时生效。
 * 用户把收藏清空后 cookie 会写入 `[]`，不会再被打回默认值。
 */
const DEFAULT_FAVORITES = ['dashboard-workbench', 'system-user', 'order-list']

/**
 * 后台菜单状态：菜单树 + 用户收藏。
 *
 * 真实接口是 `GET /user/getMenuVue3`（vben 结构），由 `loadMenus()` 拉取后规范化；
 * `NUXT_PUBLIC_USE_MOCK=true` 时直接用本地 `ADMIN_MENU_RAW`。
 * 收藏用 cookie 持久化（SSR 安全），只存 id。
 */
export const useMenuStore = defineStore('menu', () => {
  const { public: publicConfig } = useRuntimeConfig()
  const api = useApi()

  const menus = ref<AdminMenuItem[]>(
    publicConfig.useMock ? normalizeAdminMenus(ADMIN_MENU_RAW) : [],
  )
  const loaded = ref(Boolean(publicConfig.useMock))
  const loading = ref(false)

  /**
   * 拉取当前用户菜单。
   * 真实接口失败时回落到本地 mock，保证后台外壳可用（不阻塞导航）。
   */
  async function loadMenus(force = false): Promise<void> {
    if (loading.value || (loaded.value && !force)) {
      return
    }
    loading.value = true
    try {
      const raw = publicConfig.useMock ? ADMIN_MENU_RAW : await fetchUserMenusApi(api)
      menus.value = normalizeAdminMenus(raw)
      loaded.value = true
    } catch {
      if (!menus.value.length) {
        menus.value = normalizeAdminMenus(ADMIN_MENU_RAW)
      }
    } finally {
      loading.value = false
    }
  }

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
  const leafMap = computed(() => new Map(leaves.value.map((leaf) => [leaf.id, leaf])))

  /**
   * 按当前路由地址找叶子菜单：
   * 真实页面按后端 path 匹配，占位页从 `/menu/<id>` 里取 id。
   */
  function leafByPath(path: string): AdminMenuLeaf | undefined {
    if (path.startsWith('/menu/')) {
      return leafMap.value.get(path.slice('/menu/'.length))
    }
    return leaves.value.find((leaf) => leaf.path === path)
  }

  /** 收藏项，顺序与收藏时间一致 */
  const favorites = computed<AdminMenuLeaf[]>(() =>
    favoriteIds.value
      .map((id) => leafMap.value.get(id))
      .filter((leaf): leaf is AdminMenuLeaf => Boolean(leaf)),
  )

  const favoriteCount = computed(() => favorites.value.length)

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: string): void {
    setFavoriteIds(
      isFavorite(id) ? favoriteIds.value.filter((item) => item !== id) : [...favoriteIds.value, id],
    )
  }

  function removeFavorite(id: string): void {
    setFavoriteIds(favoriteIds.value.filter((item) => item !== id))
  }

  /** 拖拽排序：把 from 位置的收藏移到 to 位置（收藏顺序即数组顺序，直接落 cookie） */
  function moveFavorite(from: number, to: number): void {
    const ids = [...favoriteIds.value]
    if (from < 0 || from >= ids.length || to < 0 || to >= ids.length || from === to) {
      return
    }
    const [moved] = ids.splice(from, 1)
    if (!moved) {
      return
    }
    ids.splice(to, 0, moved)
    setFavoriteIds(ids)
  }

  function clearFavorites(): void {
    setFavoriteIds([])
  }

  return {
    menus,
    loaded,
    loading,
    loadMenus,
    favoriteIds,
    leaves,
    leafMap,
    leafByPath,
    favorites,
    favoriteCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    moveFavorite,
    clearFavorites,
  }
})
