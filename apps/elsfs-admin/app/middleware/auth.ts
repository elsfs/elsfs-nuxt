/**
 * 认证守卫：未登录用户重定向到登录页，并携带原始目标地址。
 * 用法：definePageMeta({ middleware: 'auth' })
 *
 * 注意：认证页在 `app/pages/auth/` 下，真实路径是 `/auth/login`。
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})
