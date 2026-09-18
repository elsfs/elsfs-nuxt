// 接口出入参类型集中在 api-types（`api-types/elsfs`），应用侧只保留状态与流程
import type {
  ApiError,
  AuthResponse,
  AuthStatus,
  AuthUser,
  CodeLoginPayload,
  LoginPayload,
  RegisterPayload,
  SendCodePayload,
} from 'api-types/elsfs'
import { fetchUserInfoApi, loginApi } from 'api-types/elsfs'

import { useApi } from '~/composables/useApi'

/** 接口错误码 -> i18n key；未识别的落到兜底值 */
function resolveErrorCode(error: unknown, scene?: 'login'): string {
  const apiError = error as Partial<ApiError> | undefined
  if (apiError?.name === 'ApiError' && apiError.code) {
    // 登录接口的业务失败就是账号密码错误
    return apiError.code === 'REQUEST_FAILED' && scene === 'login'
      ? 'INVALID_CREDENTIALS'
      : apiError.code
  }
  // mock 路由抛的 `{ data: { message: 'CODE' } }`
  const mockCode = (error as { data?: { message?: string } } | undefined)?.data?.message
  return mockCode || 'NETWORK_ERROR'
}

/**
 * 认证状态管理（Pinia）
 * - token 通过 cookie 持久化（SSR 安全），由 `plugins/api.ts` 注入的 `$authToken` 持有；
 * - 登录 / 用户信息走真实后端（`NUXT_PUBLIC_USE_MOCK=true` 时回落到本地 mock）；
 * - 状态机：idle -> loading -> success | error；
 * - errorCode 为错误码，UI 层结合 i18n 翻译。
 */
export const useAuthStore = defineStore('auth', () => {
  const nuxtApp = useNuxtApp()
  const { public: publicConfig } = useRuntimeConfig()
  const api = useApi()
  const token = nuxtApp.$authToken

  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const errorCode = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const useMock = computed(() => Boolean(publicConfig.useMock))

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
   * 演示功能（验证码 / 二维码 / 社交 / 注册）目前只有本地 mock，
   * 真实后端模式下直接拒绝，避免拿到 mock 令牌后又被真实接口登出。
   */
  function requireMock(): void {
    if (useMock.value) {
      return
    }
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

  /** mock 认证接口共用的请求包装（登录 / 注册 / 验证码登录 / 社交登录） */
  async function handleMockAuthRequest(
    request: Promise<AuthResponse>,
    scene?: 'login',
  ): Promise<AuthResponse> {
    status.value = 'loading'
    errorCode.value = null
    try {
      const data = await request
      token.value = data.token
      user.value = data.user
      status.value = 'success'
      return data
    } catch (e: unknown) {
      fail(e, scene)
      throw e
    }
  }

  async function login(payload: LoginPayload): Promise<void> {
    if (useMock.value) {
      await handleMockAuthRequest(
        $fetch<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: payload,
        }),
        'login',
      )
      return
    }

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

  /**
   * 验证码登录（演示）。
   * 真实后端对应 `/login/phone/sms`，本仓库暂未接入，这里只在 mock 模式可用。
   */
  async function codeLogin(payload: CodeLoginPayload): Promise<AuthResponse> {
    requireMock()
    return handleMockAuthRequest(
      $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { username: payload.email, password: payload.code, remember: false },
      }),
      'login',
    )
  }

  /**
   * 发送验证码（演示）。
   * - 不真实发送短信/邮件，仅模拟等待并成功返回；
   * - 返回的 mock 验证码固定为 123456，可在 UI 上作为提示展示。
   */
  async function sendCode(payload: SendCodePayload): Promise<string> {
    requireMock()
    status.value = 'loading'
    errorCode.value = null
    try {
      await $fetch('/api/auth/send-code', {
        method: 'POST',
        body: payload,
      })
      status.value = 'success'
      return '123456'
    } catch (e: unknown) {
      fail(e)
      throw e
    }
  }

  /** 发送密码重置邮件（演示） */
  async function forgetPassword(email: string): Promise<void> {
    requireMock()
    errorCode.value = null
    status.value = 'loading'
    try {
      await $fetch('/api/auth/forget-password', {
        method: 'POST',
        body: { email },
      })
      status.value = 'success'
    } catch (e: unknown) {
      fail(e)
      throw e
    }
  }

  async function register(payload: RegisterPayload): Promise<AuthResponse> {
    requireMock()
    return handleMockAuthRequest(
      $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: payload,
      }),
    )
  }

  async function socialLogin(provider: string): Promise<AuthResponse> {
    requireMock()
    return handleMockAuthRequest(
      $fetch<AuthResponse>('/api/auth/social', {
        method: 'POST',
        body: { provider },
      }),
    )
  }

  /** 拉取当前用户信息（刷新页面后恢复登录态） */
  async function fetchUser(): Promise<void> {
    if (!token.value || user.value) {
      return
    }
    try {
      user.value = useMock.value ? await $fetch<AuthUser>('/api/auth/me') : await loadRealUser()
    } catch (e: unknown) {
      // 只有确认登录态失效才清本地状态；网络异常保留 token，下次再拉
      if ((e as Partial<ApiError> | undefined)?.code === 'UNAUTHORIZED') {
        clearAuth()
      }
    }
  }

  async function logout(): Promise<void> {
    if (useMock.value) {
      // 尽力通知 mock 服务端，失败不影响本地登出
      await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    }
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
    useMock,
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
