import type { RequestClient } from 'nuxt-request/runtime'

/**
 * 菜单接口契约（vben / onehip 结构）。
 *
 * 后端下发的原始结构：
 * `{ name, path, redirect, component, meta: { title, icon, order, affixTab, ... }, children }`，
 * 接口外层是 `{ code, data, error, message }`。
 *
 * 应用侧把原始结构抹平成自己的视图模型（如 elsfs-admin 的 `AdminMenuItem`），
 * 这里只保留接口本身的形状。
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

/**
 * 获取当前用户菜单树（vben 结构，`meta.title` / `meta.icon` + 顶层 `id`）。
 * @see GET /user/getMenuVue3
 */
export function fetchUserMenusApi(client: RequestClient): Promise<BackendMenu[]> {
  return client.get<BackendMenu[]>('/user/getMenuVue3')
}
