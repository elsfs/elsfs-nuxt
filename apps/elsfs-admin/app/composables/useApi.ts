import type { RequestClient } from 'nuxt-request/runtime'

/**
 * 取 `plugins/api.ts` 注入的请求客户端。
 * 已装配 Bearer token、`{ code, result }` 信封拆解与错误归一化。
 */
export function usAepi(): RequestClient {
  return useNuxtApp().$api
}
