/**
 * elsfs-admin 认证相关的应用内类型（用户模型 + 各表单请求体）。
 *
 * 登录 / 用户信息已走真实后端（见 `./auth.ts`），应用侧把后端返回映射成这里的
 * `AuthUser`；其余尚未接入后端的演示表单（注册 / 验证码 / 社交 / 找回密码）仍复用这些入参契约。
 */

/** 应用内的登录用户（由真实后端 `getUserInfo` 映射而来） */
export interface AuthUser {
  id: string
  name: string
  username?: string
  email: string
  avatar?: string
  authorities?: string[]
}

/** 账号密码登录表单（`login` 已改走真实后端，此结构仅用于入参承接） */
export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}

/** 注册表单请求体（后端暂未提供接口） */
export interface RegisterPayload {
  username: string
  email: string
  password: string
}

/** 验证码登录表单请求体（后端暂未提供接口） */
export interface CodeLoginPayload {
  email: string
  code: string
}

/** 验证码用途：登录 / 找回密码 */
export type CodeScene = 'login' | 'forget'

/** 发送验证码的请求体（后端暂未提供接口） */
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
