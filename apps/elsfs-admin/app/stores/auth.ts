// 接口出入参类型集中在 api-types（`api-types/elsfs`），应用侧只保留状态与流程
import type {
  ApiError,
  AuthStatus,
  AuthUser,
  CodeLoginPayload,
  LoginPayload,
  RegisterPayload,
  SendCodePayload,
} from 'api-types/elsfs'
import { fetchUserInfoApi, loginApi } from 'api-types/elsfs'

import { useApi } from '~/composables/useApi'

/** 接口错误 -> 归一化的错误码；未识别的落到兜底值 */
function resolveErrorCode(error: unknown, scene?: 'login'): string {
  const apiError = error as Partial<ApiError> | undefined
  if (apiError?.name === 'ApiError' && apiError.code) {
    // 登录接口的业务失败就是账号密码错误
    return apiError.code === 'REQUEST_FAILED' && scene === 'login'
      ? 'INVALID_CREDENTIALS'
      : apiError.code
  }
  return 'NETWORK_ERROR'
}

/**
 * 认证状态管理（Pinia）
 * - token 通过 cookie 持久化（SSR 安全），由 `plugins/api.ts` 注入的 `$authToken` 持有；
 * - 登录 / 用户信息走真实后端；
 * - 状态机：idle -> loading -> success | error；
 * - errorCode 为错误码，UI 层用 `authErrorMessage` 映射成中文提示。
 */
export const useAuthStore = defineStore('auth', () => {
  const nuxtApp = useNuxtApp()
  const api = useApi()
  const token = nuxtApp.$authToken

  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const errorCode = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function fail(error: unknown, scene?: 'login'): void {
    status.value = 'error'
    errorCode.value = resolveErrorCode(error, scene)
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    status.value = 'idle'
    errorCode.value = null
  }

  /**
   * 注册 / 验证码登录 / 发送验证码 / 找回密码 / 社交登录：后端暂未提供接口。
   * 页面保留，提交时统一以 NOT_SUPPORTED 拒绝，UI 通过 `authErrorMessage` 给出提示。
   */
  function rejectNotSupported(): never {
    const error: ApiError = { name: 'ApiError', code: 'NOT_SUPPORTED', message: '' }
    fail(error)
    throw error
  }

  /** 拉真实后端的当前用户，并映射成应用内部结构 */
  async function loadRealUser(): Promise<AuthUser> {
    const info = await fetchUserInfoApi(api)
    return {
      id: info.userId,
      name: info.nickname || info.username,
      username: info.username,
      email: info.email ?? '',
      avatar: info.avatar,
      authorities: info.authorities ?? [],
    }
  }

  async function login(payload: LoginPayload): Promise<void> {
    status.value = 'loading'
    errorCode.value = null
    try {
      const result = await loginApi(api, {
        username: payload.username,
        password: payload.password,
      })
      token.value = result.access_token
      user.value = await loadRealUser()
      status.value = 'success'
    } catch (e: unknown) {
      fail(e, 'login')
      throw e
    }
  }

  /** 验证码登录：后端暂未提供接口 */
  async function codeLogin(_payload: CodeLoginPayload): Promise<never> {
    rejectNotSupported()
  }

  /** 发送验证码：后端暂未提供接口 */
  async function sendCode(_payload: SendCodePayload): Promise<never> {
    rejectNotSupported()
  }

  /** 发送密码重置邮件：后端暂未提供接口 */
  async function forgetPassword(_email: string): Promise<never> {
    rejectNotSupported()
  }

  /** 注册：后端暂未提供接口 */
  async function register(_payload: RegisterPayload): Promise<never> {
    rejectNotSupported()
  }

  /** 社交登录：后端暂未提供接口 */
  async function socialLogin(_provider: string): Promise<never> {
    rejectNotSupported()
  }

  /** 拉取当前用户信息（刷新页面后恢复登录态） */
  async function fetchUser(): Promise<void> {
    if (!token.value || user.value) {
      return
    }
    try {
      user.value =  await loadRealUser()
    } catch (e: unknown) {
      // 只有确认登录态失效才清本地状态；网络异常保留 token，下次再拉
      if ((e as Partial<ApiError> | undefined)?.code === 'UNAUTHORIZED') {
        clearAuth()
      }
    }
  }

  async function logout(): Promise<void> {
    // 真实后端未提供登出接口，清除本地令牌即可
    clearAuth()
  }

  /** 重置请求状态与错误信息（表单重置时调用） */
  function reset(): void {
    status.value = 'idle'
    errorCode.value = null
  }

  return {
    token,
    user,
    status,
    errorCode,
    isAuthenticated,
    login,
    register,
    codeLogin,
    sendCode,
    forgetPassword,
    socialLogin,
    fetchUser,
    logout,
    reset,
  }
})
