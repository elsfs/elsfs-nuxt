/**
 * 后台菜单数据结构。
 *
 * 目前菜单树是前端 mock（见 `~/utils/admin-menu.ts`），真实项目里应由后端接口下发；
 * 收藏列表只持久化菜单 id，因此 id 需要在同一应用内保持稳定。
 */
export interface AppMenuItem {
  /** 唯一标识，收藏列表只存它 */
  id: string
  /** 菜单名称 */
  name: string
  /** Element Plus 图标短名，交给 `AppIcon` 解析 */
  icon?: string
  /** 路由地址；缺省时回落到占位页 `/menu/<id>` */
  path?: string
  /** 二级菜单 */
  children?: AppMenuItem[]
}

/** 展平的叶子菜单（真正可点击 / 可收藏的项），附带父级信息（用于取图标块配色） */
export interface AppMenuLeaf extends AppMenuItem {
  parentId: string
  parentName: string
  parentIcon?: string
}
