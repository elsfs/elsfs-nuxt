import type { RequestClient } from 'nuxt-request/runtime'
import type { Ref } from 'vue'

/**
 * `plugins/api.ts` 注入的运行时对象类型。
 * 用 `useNuxtApp().$api` / `useNuxtApp().$authToken` 访问。
 */
declare module '#app' {
  interface NuxtApp {
    /** 已装配 token 与信封处理的请求客户端 */
    $api: RequestClient
    /** token cookie ref（与 auth store 共用） */
    $authToken: Ref<string | null>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: RequestClient
    $authToken: Ref<string | null>
  }
}
