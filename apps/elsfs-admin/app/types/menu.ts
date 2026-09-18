import type { BackendMenuMeta } from 'api-types/elsfs'

/**
 * 菜单视图模型（应用内部结构）。
 *
 * 接口侧的原始结构（`BackendMenu` / `BackendMenuMeta` / `BackendMenuResponse`）由
 * api-types 的 `api-types/elsfs` 提供，这里只放「抹平后」的节点模型：
 * 抽屉、搜索、收藏、多页签都只认这一套。
 */

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
