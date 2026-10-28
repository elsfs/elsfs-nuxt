import type { ApiError } from 'api-types/elsfs'

/**
 * 把请求层抛出的错误翻译成可直接展示给用户的中文提示。
 *
 * - `UNAUTHORIZED`：登录态失效（响应拦截器已经触发跳转，这里只做兜底文案）；
 * - `NETWORK_ERROR`：断网 / 超时；
 * - 其它（`REQUEST_FAILED`）：优先后端信封里的 `message`，后端没给就回落到默认文案。
 */
export function toErrorMessage(error: unknown, fallback = '操作失败，请稍后重试'): string {
  const apiError = error as Partial<ApiError> | undefined
  if (apiError?.name !== 'ApiError') {
    return fallback
  }
  if (apiError.code === 'UNAUTHORIZED') {
    return '登录已失效，请重新登录'
  }
  if (apiError.code === 'NETWORK_ERROR') {
    return '网络异常，请检查网络后重试'
  }
  return apiError.message || fallback
}
