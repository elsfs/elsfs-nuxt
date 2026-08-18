function isAuthenticated(): boolean {
  return false
}

export default defineNuxtRouteMiddleware((_to, _from) => {
  // isAuthenticated() 是一个示例方法，用于验证用户是否已认证
  if (isAuthenticated() === false) {
    return navigateTo('/login')
  }
})
