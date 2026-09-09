export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface CodeLoginPayload {
  email: string
  code: string
}

/** 发送验证码的请求体 */
export interface SendCodePayload {
  email: string
  scene: 'login' | 'forget'
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error'

export type CodeScene = 'login' | 'forget'

/**
 * 认证状态管理（Pinia）
 * - token 通过 cookie 持久化（SSR 安全）
 * - 状态机：idle -> loading -> success | error
 * - errorCode 为服务端返回的错误码，由 UI 层结合 i18n 翻译
 */
export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('elsfs_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    sameSite: 'lax',
  })

  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const errorCode = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function handleRequest(request: Promise<AuthResponse>): Promise<AuthResponse> {
    status.value = 'loading'
    errorCode.value = null
    try {
      const data = await request
      token.value = data.token
      user.value = data.user
      status.value = 'success'
      return data
    }
    catch (e: unknown) {
      status.value = 'error'
      errorCode.value = (e as { data?: { message?: string } })?.data?.message || 'NETWORK_ERROR'
      throw e
    }
  }

  async function login(payload: LoginPayload): Promise<AuthResponse> {
    return handleRequest($fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    }))
  }

  /**
   * 验证码登录。
   * 演示环境：验证码直接复用登录端点（以 email 作为账号），
   * code 仅用于前端演示，不参与服务端真实校验。
   */
  async function codeLogin(payload: CodeLoginPayload): Promise<AuthResponse> {
    return handleRequest($fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: payload.code, remember: false },
    }))
  }

  /**
   * 发送验证码（演示）。
   * - 不真实发送短信/邮件，仅模拟等待并成功返回；
   * - 返回的 mock 验证码固定为 123456，可在 UI 上作为提示展示。
   */
  async function sendCode(payload: SendCodePayload): Promise<string> {
    status.value = 'loading'
    errorCode.value = null
    try {
      await $fetch('/api/auth/send-code', {
        method: 'POST',
        body: payload,
      })
      status.value = 'success'
      return '123456'
    }
    catch (e: unknown) {
      status.value = 'error'
      errorCode.value = (e as { data?: { message?: string } })?.data?.message || 'NETWORK_ERROR'
      throw e
    }
  }

  /** 发送密码重置邮件（演示） */
  async function forgetPassword(email: string): Promise<void> {
    errorCode.value = null
    status.value = 'loading'
    try {
      await $fetch('/api/auth/forget-password', {
        method: 'POST',
        body: { email },
      })
      status.value = 'success'
    }
    catch (e: unknown) {
      status.value = 'error'
      errorCode.value = (e as { data?: { message?: string } })?.data?.message || 'NETWORK_ERROR'
      throw e
    }
  }

  async function register(payload: RegisterPayload): Promise<AuthResponse> {
    return handleRequest($fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    }))
  }

  async function socialLogin(provider: string): Promise<AuthResponse> {
    return handleRequest($fetch<AuthResponse>('/api/auth/social', {
      method: 'POST',
      body: { provider },
    }))
  }

  /** 拉取当前用户信息（刷新页面后恢复登录态） */
  async function fetchUser(): Promise<void> {
    if (!token.value || user.value) return
    try {
      user.value = await $fetch<AuthUser>('/api/auth/me')
    }
    catch {
      logout()
    }
  }

  async function logout(): Promise<void> {
    // 尽力通知服务端，失败不影响本地登出
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    token.value = null
    user.value = null
    status.value = 'idle'
    errorCode.value = null
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
