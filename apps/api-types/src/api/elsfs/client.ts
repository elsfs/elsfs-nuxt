import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  RequestClient,
} from 'nuxt-request/runtime'

/**
 * elsfs 后台的请求层公共契约：响应信封 + 归一化错误 + 客户端工厂。
 *
 * 这里只放「与具体应用无关」的部分：baseURL、token 读取、登录态失效后的跳转
 * 都由应用侧通过 {@link CreateApiClientOptions} 注入（如 elsfs-admin 的
 * `app/plugins/api.ts`）。
 */

/**
 * 后端统一响应信封：`{ code, message, type, success, result, timestamp }`。
 * - `code === 0` 表示成功，数据在 `result`（不是 `data`）；
 * - 业务失败（含 token 失效）依然是 HTTP 200，只能靠信封判断。
 */
export interface ApiEnvelope<T = unknown> {
  code: number
  message?: string
  /** 业务类型：`success` / `error` / `invalid_token` ... */
  type?: string
  success?: boolean
  result?: T
  timestamp?: string
}

/** 归一化后的接口错误：UI 只认 `code` 并交给 i18n 翻译 */
export interface ApiError {
  name: 'ApiError'
  /** 错误码：`UNAUTHORIZED` / `NETWORK_ERROR` / `REQUEST_FAILED` */
  code: string
  /** 后端原始 message（可能为空） */
  message: string
  /** HTTP 状态码（后端业务错误时通常为 200） */
  status?: number
  /** 原始响应信封 */
  envelope?: ApiEnvelope
  /** 原始错误对象，便于排查 */
  cause?: unknown
}

const SUCCESS_CODE = 0

/** 错误对象的最小结构（axios 错误 / 拦截器抛出的响应副本） */
interface ErrorLike {
  name?: string
  message?: string
  status?: number
  data?: unknown
  response?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asErrorLike(value: unknown): ErrorLike {
  return isRecord(value) ? (value as ErrorLike) : {}
}

/** 从错误对象里取回响应信封（`defaultResponseInterceptor` 抛出的对象本身带 `data`） */
function getEnvelope(error: unknown): ApiEnvelope | undefined {
  const err = asErrorLike(error)
  const data = err.data ?? asErrorLike(err.response).data
  return isRecord(data) && 'code' in data ? (data as unknown as ApiEnvelope) : undefined
}

/**
 * 把 axios / 业务错误统一成 {@link ApiError}。
 * - 信封里 `type === 'invalid_token'` → `UNAUTHORIZED`
 * - 其它带信封的失败 → `REQUEST_FAILED`
 * - 没有响应体（网络中断、超时）→ `NETWORK_ERROR`
 */
export function normalizeApiError(error: unknown): ApiError {
  const err = asErrorLike(error)
  if (err.name === 'ApiError') {
    return error as ApiError
  }

  const envelope = getEnvelope(error)
  const status = err.status ?? asErrorLike(err.response).status

  if (envelope) {
    return {
      name: 'ApiError',
      code: envelope.type === 'invalid_token' ? 'UNAUTHORIZED' : 'REQUEST_FAILED',
      message: envelope.message ?? '',
      status,
      envelope,
      cause: error,
    }
  }

  return {
    name: 'ApiError',
    code: 'NETWORK_ERROR',
    message: err.message ?? '',
    status,
    cause: error,
  }
}

export interface CreateApiClientOptions {
  baseURL: string
  /** 每次请求时读取当前 token（登录后立即可用） */
  getToken: () => null | string | undefined
  /** 后端判定登录态失效时的回调（清 token + 跳登录页） */
  onUnauthorized: () => Promise<void> | void
}

/**
 * 创建对接本后端的请求客户端：
 * 1. 注入 `Authorization: Bearer <token>`；
 * 2. 拆 `{ code, result }` 信封，成功时只返回 `result`；
 * 3. `type === 'invalid_token'` 时触发 `onUnauthorized`；
 * 4. 最后把错误统一成 {@link ApiError}。
 */
export function createApiClient({
  baseURL,
  getToken,
  onUnauthorized,
}: CreateApiClientOptions): RequestClient {
  const client = new RequestClient({
    baseURL,
    responseReturn: 'data',
    timeout: 15_000,
  })

  client.addRequestInterceptor({
    fulfilled: (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
  })

  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'result',
      successCode: SUCCESS_CODE,
    }),
  )

  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate: async () => {
        await onUnauthorized()
      },
      // 后端未提供刷新令牌接口，关闭 refreshToken 分支
      doRefreshToken: async () => '',
      enableRefreshToken: false,
      formatToken: (token) => (token ? `Bearer ${token}` : null),
      // token 失效是 HTTP 200 的业务错误，用 type 判定
      isTokenExpired: (error) => error?.data?.type === 'invalid_token',
    }),
  )

  client.addResponseInterceptor({
    rejected: (error) => {
      throw normalizeApiError(error)
    },
  })

  return client
}
