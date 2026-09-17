import { createApiClient } from '~/api/client'

/**
 * 注入全局请求客户端与 token cookie ref。
 *
 * - `$api`：已装配 Bearer token / 信封拆解 / 错误归一化的 `RequestClient`；
 * - `$authToken`：与 auth store 共用的同一个 cookie ref，保证登录后请求立即带上新 token。
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { public: publicConfig } = useRuntimeConfig()

  const authToken = useCookie<string | null>('elsfs_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  // 多个请求同时判定 token 失效时，只跳转一次登录页
  let redirecting = false

  const api = createApiClient({
    baseURL: publicConfig.apiBase,
    getToken: () => authToken.value,
    onUnauthorized: async () => {
      authToken.value = null
      if (redirecting || !import.meta.client) {
        return
      }
      redirecting = true
      try {
        await nuxtApp.runWithContext(() => navigateTo('/auth/login'))
      } finally {
        redirecting = false
      }
    },
  })

  return {
    provide: {
      api,
      authToken,
    },
  }
})
