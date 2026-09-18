/**
 * 演示环境认证接口的请求体 / 响应体契约。
 *
 * 对应 elsfs-admin 的 Nitro mock 路由（`server/api/auth/*`）：
 * 该应用没有可用后端时（`NUXT_PUBLIC_USE_MOCK=true`）认证流程全部走这几个端点。
 */

/** 应用内的登录用户：`POST /api/auth/login|register|social` 的 `user` 与 `GET /api/auth/me` */
export interface AuthUser {
  id: string
  name: string
  username?: string
  email: string
  avatar?: string
  authorities?: string[]
}

/** `POST /api/auth/login` 请求体（账号密码登录表单） */
export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}

/** `POST /api/auth/register` 请求体 */
export interface RegisterPayload {
  username: string
  email: string
  password: string
}

/** `POST /api/auth/login`（验证码登录复用该端点）请求体 */
export interface CodeLoginPayload {
  email: string
  code: string
}

/** 验证码用途：登录 / 找回密码 */
export type CodeScene = 'login' | 'forget'

/** 发送验证码的请求体（`POST /api/auth/send-code`） */
export interface SendCodePayload {
  email: string
  scene: CodeScene
}

/** 登录类接口（login / register / social）的响应体 */
export interface AuthResponse {
  token: string
  user: AuthUser
}

/** 认证请求状态机：idle -> loading -> success | error */
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error'
