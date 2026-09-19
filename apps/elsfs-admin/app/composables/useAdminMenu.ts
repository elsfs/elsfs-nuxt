import type { AdminMenuItem } from '~/types/menu'
import { fallbackMenuPath } from '~/utils/admin-menu'

/**
 * 菜单标题解析。
 *
 * 后端下发的 `meta.title` 直接作为展示文案，这里只做空值兼容。
 */
export function useMenuTitle() {
  return (title?: string): string => title ?? ''
}

/**
 * 菜单跳转地址。
 *
 * 后端给的 `path` 在应用里有对应页面就直接用，否则落到占位页 `/menu/<id>`
 * （mock 里只有 `/datshboard` 是真实页面，其余都是后端占位数据）。
 *
 * 这里用路由表自己拼正则判断，而不是 `router.resolve()`——
 * 后者对匹配不到的地址会在控制台刷 `No match found for location` 警告。
 */
export function useMenuPath() {
  const router = useRouter()

  const matchers = router
    .getRoutes()
    .filter((record) => !record.path.includes(':pathMatch'))
    .map((record) => new RegExp(`^${record.path.replace(/:[^/]+/g, '[^/]+')}/?$`))

  return (item: AdminMenuItem): string => {
    const target = item.path ?? item.redirect
    if (target && matchers.some((matcher) => matcher.test(target))) {
      return target
    }
    return fallbackMenuPath(item)
  }
}
