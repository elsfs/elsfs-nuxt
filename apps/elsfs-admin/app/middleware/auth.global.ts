/**
 * 全局认证守卫：除 `/auth` 下的认证页外，所有路由都必须登录后才能访问。
 *
 * - `/auth/*` 交给 `guest` 守卫处理（已登录访问登录/注册页时跳走），这里直接放行；
 * - 其余路由未登录时重定向到登录页，并携带原始目标地址；
 * - 通过校验后加载当前用户菜单（`GET /user/getMenuVue3`），这样布局 setup 时菜单已就绪，
 *   多页签能拿到正确的标题；拉取失败时 menu store 会回落到本地 mock，不阻塞导航。
 *
 * 注意：认证页在 `app/pages/auth/` 下，真实路径是 `/auth/login`。
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // 认证相关页面（/auth、/auth/xxx）由 guest 守卫负责，这里不拦截
  if (to.path === '/auth' || to.path.startsWith('/auth/')) {
    return
  }

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  await useMenuStore().loadMenus()
})
