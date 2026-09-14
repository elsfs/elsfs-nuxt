import type { AdminMenuItem } from '~/types/menu'
import { fallbackMenuPath } from '~/utils/admin-menu'

/**
 * 菜单标题解析。
 *
 * 后端下发的 `meta.title` 既可能是 i18n key（`demos.title`），也可能是字面文案，
 * 这里统一处理：语言包里找得到 key 就用翻译，否则原样显示。
 */
export function useMenuTitle() {
  const { t, te } = useI18n()

  return (title?: string): string => {
    if (!title) {
      return ''
    }
    return te(title) ? t(title) : title
  }
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

  const matchers = router.getRoutes()
    .filter(record => !record.path.includes(':pathMatch'))
    .map(record => new RegExp(`^${record.path.replace(/:[^/]+/g, '[^/]+')}/?$`))

  return (item: AdminMenuItem): string => {
    const target = item.path ?? item.redirect
    if (target && matchers.some(matcher => matcher.test(target))) {
      return target
    }
    return fallbackMenuPath(item)
  }
}
