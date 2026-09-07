/**
 * 访客守卫：已登录用户访问登录/注册页时，重定向回首页或原始目标地址。
 * 用法：definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/'
    return navigateTo(redirect)
  }
})
