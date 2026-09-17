import type { RequestClient } from 'nuxt-request/runtime'

import type { BackendMenu } from '~/types/menu'

/**
 * 真实后端接口定义（Swagger: http://192.168.0.102:6002/swagger-ui/index.html#/）。
 *
 * 请求客户端已在 `app/api/client.ts` 里拆掉 `{ code, message, result }` 信封：
 * 成功时这里拿到的就是 `result` 本体，失败时抛的是 `ApiError`。
 */

/** `POST /login`（账号密码 json 登录）请求体 */
export interface LoginParams {
  username: string
  password: string
}

/** `POST /login` 返回的令牌信息 */
export interface LoginResult {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

/** `GET /user/getUserInfo` 返回的用户信息 */
export interface BackendUserInfo {
  userId: string
  username: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  sex?: string
  tenantId?: string
  deptIds?: string[]
  authorities?: string[]
  validFlag?: string
}

/**
 * 账号密码登录。
 * @see POST /login
 */
export function loginApi(client: RequestClient, data: LoginParams): Promise<LoginResult> {
  return client.post<LoginResult>('/login', data)
}

/**
 * 获取当前登录用户信息。
 * @see GET /user/getUserInfo
 */
export function fetchUserInfoApi(client: RequestClient): Promise<BackendUserInfo> {
  return client.get<BackendUserInfo>('/user/getUserInfo')
}

/**
 * 获取当前用户菜单树（vben 结构，`meta.title` / `meta.icon` + 顶层 `id`）。
 * @see GET /user/getMenuVue3
 */
export function fetchUserMenusApi(client: RequestClient): Promise<BackendMenu[]> {
  return client.get<BackendMenu[]>('/user/getMenuVue3')
}

// 后端 Swagger 未提供登出接口：登出只需前端清除令牌即可（见 auth store）。
