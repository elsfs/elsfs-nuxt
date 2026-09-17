/**
 * 菜单相关类型。
 *
 * `BackendMenu*` 是后端下发的原始结构（参考 vben / onehip 的接口格式）：
 * `{ name, path, redirect, component, meta: { title, icon, order, affixTab, ... }, children }`，
 * 接口外层是 `{ code, data, error, message }`。
 *
 * `AdminMenuItem` 是内部抹平后的节点，页面只认这一套。
 */

/** 后端 meta：字段含义对齐 vben 的 RouteMeta */
export interface BackendMenuMeta {
  /** 菜单标题：可以是 i18n key（`page.dashboard.title`），也可以是字面文案 */
  title?: string
  /** 图标：iconify 全名（`mdi:cloud-key-outline`）或 Element Plus 短名（`user`） */
  icon?: string
  /** 排序，越小越靠前 */
  order?: number
  /** 固定在多页签里（不可关闭） */
  affixTab?: boolean
  /** 是否缓存组件 */
  keepAlive?: boolean
  /** 权限码 */
  authority?: string[]
  /** 无权限时菜单可见、打开后是 403 */
  menuVisibleWithForbidden?: boolean
  /** 稳定 id：后端没给就退回 name / path */
  id?: string
}

/** 后端菜单节点 */
export interface BackendMenu {
  /** 后端菜单 id（真实接口是顶层字段，收藏 / 匹配依赖它） */
  id?: string
  /** 父级 id（顶层为 "0"） */
  parentId?: string
  name?: string
  path?: string
  redirect?: string
  /** 前端组件路径，Nuxt 下由 pages/ 决定路由，这里只做保留 */
  component?: string
  meta?: BackendMenuMeta
  children?: BackendMenu[]
}

/** 后端菜单接口响应 */
export interface BackendMenuResponse {
  code: number
  data: BackendMenu[]
  error?: unknown
  message?: string
}

/** 内部菜单节点（展示用） */
export interface AdminMenuItem {
  /** 唯一标识（meta.id -> name -> path），收藏列表只存它 */
  id: string
  /** 标题，可能是 i18n key，展示时用 `useMenuTitle()` 解析 */
  title: string
  /** 图标：iconify 名或 Element Plus 短名，交给 `AppIcon` */
  icon?: string
  /** 路由地址 */
  path?: string
  /** 有子级时的默认跳转地址 */
  redirect?: string
  /** 原始 meta 透传（order / keepAlive / affixTab / authority...） */
  meta: BackendMenuMeta
  children?: AdminMenuItem[]
}

/**
 * 展平出的叶子菜单（最深层、真正可点击 / 可收藏的项）。
 * 带上所属一级菜单（子系统）与二级分组，便于取图标配色和面包屑。
 */
export interface AdminMenuLeaf extends AdminMenuItem {
  /** 一级菜单（子系统） */
  rootId: string
  rootTitle: string
  rootIcon?: string
  /** 二级分组（没有分组时为空） */
  groupId?: string
  groupTitle?: string
}
