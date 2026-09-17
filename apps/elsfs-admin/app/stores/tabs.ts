export interface AppTab {
  /** 路由地址，同时作为标签唯一标识 */
  path: string
  /** 标签文字：可能是 i18n key（后端 meta.title），展示时用 `useMenuTitle()` 解析 */
  title: string
  /** 对应的叶子菜单 id（用于右键收藏），非菜单页为空 */
  menuId?: string
  icon?: string
  /** 后端 meta.affixTab：固定标签，不可关闭（关闭全部 / 关闭其他时也保留） */
  affix?: boolean
}

/**
 * 顶部多页签（参考 onehip-frontend 的 tagsView）。
 *
 * 打开的页面记在 cookie 里，刷新 / 重开浏览器都还在；
 * 组件见 `AdminTabsView`。
 */
export const useTabsStore = defineStore('tabs', () => {
  const tabCookie = useCookie<AppTab[] | null>('elsfs_menu_tabs', {
    default: () => [],
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })

  /** cookie 被外部清掉时会变成 null，统一兜底成数组 */
  const tabs = computed<AppTab[]>(() => (Array.isArray(tabCookie.value) ? tabCookie.value : []))

  function persist(list: AppTab[]): void {
    tabCookie.value = list
  }

  /** 记录一个已打开的页面：按 path 去重，已存在则刷新标题 */
  function openTab(tab: AppTab): void {
    const list = [...tabs.value]
    const index = list.findIndex((item) => item.path === tab.path)
    if (index > -1) {
      list[index] = { ...list[index], ...tab }
    } else {
      list.push(tab)
    }
    persist(list)
  }

  /** 固定标签（affixTab）不允许关闭 */
  function closeTab(path: string): void {
    persist(tabs.value.filter((item) => item.path !== path || item.affix))
  }

  function closeOthers(path: string): void {
    persist(tabs.value.filter((item) => item.path === path || item.affix))
  }

  function closeAll(): void {
    persist(tabs.value.filter((item) => item.affix))
  }

  /** 拖拽排序 */
  function moveTab(from: number, to: number): void {
    const list = [...tabs.value]
    if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) {
      return
    }
    const [moved] = list.splice(from, 1)
    if (!moved) {
      return
    }
    list.splice(to, 0, moved)
    persist(list)
  }

  return { tabs, openTab, closeTab, closeOthers, closeAll, moveTab }
})
