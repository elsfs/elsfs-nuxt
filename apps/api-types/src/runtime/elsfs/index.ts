/**
 * elsfs 后台接口集合：请求层契约（信封 / 错误 / 客户端工厂）+ 各领域接口与出入参类型。
 *
 * 应用侧通过 `api-types/elsfs` 子路径导入，例如：
 * ```ts
 * import { createApiClient } from 'api-types/elsfs'
 * import type { ApiError, AuthUser } from 'api-types/elsfs'
 * ```
 */
export * from './auth'
export * from './authMock'
export * from './client'
export * from './menu'
