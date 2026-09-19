/**
 * 认证错误码到提示文案的映射。
 *
 * 服务端统一用 `createError({ message: 'XXX' })` 抛出错误码，落到 store 的 `errorCode`，
 * UI 层再用这里映射成中文提示。新增错误码时两边（抛出 + 这里）同时补。
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: '请求参数有误，请检查后重试',
  INVALID_CREDENTIALS: '用户名或密码错误',
  EMAIL_TAKEN: '该邮箱已被注册',
  UNAUTHORIZED: '登录状态已失效，请重新登录',
  REQUEST_FAILED: '请求失败，请稍后重试',
  NETWORK_ERROR: '网络异常，请稍后重试',
  NOT_SUPPORTED: '该功能暂未接入后端接口，请开启 mock 模式后使用',
}

/** 按错误码返回中文提示，未知错误码兜底为通用失败文案。 */
export function authErrorMessage(code?: string | null): string {
  if (!code) {
    return ''
  }
  return ERROR_MESSAGES[code] ?? '请求失败，请稍后重试'
}
