import { describe, expect, it, vi } from 'vitest'

import { authenticateResponseInterceptor } from '../../src/runtime/utils/preset-interceptors'
import type { RequestClient } from '../../src/runtime/utils/request-client'

/** 只用到 authenticateResponseInterceptor 里的 client.isRefreshing / refreshTokenQueue */
function createClient() {
  return {
    isRefreshing: false,
    refreshTokenQueue: [],
    request: vi.fn(),
  } as unknown as RequestClient
}

function createInterceptor(options?: { isTokenExpired?: (error: any) => boolean }) {
  const doReAuthenticate = vi.fn(async () => {})
  const doRefreshToken = vi.fn(async () => 'new-token')
  const client = createClient()

  const interceptor = authenticateResponseInterceptor({
    client,
    doReAuthenticate,
    doRefreshToken,
    enableRefreshToken: false,
    formatToken: (token) => `Bearer ${token}`,
    ...options,
  })

  return { client, doReAuthenticate, doRefreshToken, interceptor }
}

describe('authenticateResponseInterceptor', () => {
  it('默认只把 HTTP 401 当作登录态失效', async () => {
    const { interceptor, doReAuthenticate } = createInterceptor()
    const error = { config: {}, response: { status: 403 } }

    await expect(interceptor.rejected!(error)).rejects.toBe(error)
    expect(doReAuthenticate).not.toHaveBeenCalled()
  })

  it('HTTP 401 触发重新认证', async () => {
    const { interceptor, doReAuthenticate } = createInterceptor()
    const error = { config: {}, response: { status: 401 } }

    await expect(interceptor.rejected!(error)).rejects.toBe(error)
    expect(doReAuthenticate).toHaveBeenCalledTimes(1)
  })

  it('HTTP 200 的业务体 token 过期也能识别（isTokenExpired）', async () => {
    // 后端把 token 过期包在 HTTP 200 的响应体里，由 defaultResponseInterceptor 抛出
    const error = {
      config: {},
      status: 200,
      data: { code: -1, type: 'invalid_token', message: 'token 已经过期' },
    }
    const { interceptor, doReAuthenticate } = createInterceptor({
      isTokenExpired: (err) => err?.data?.type === 'invalid_token',
    })

    await expect(interceptor.rejected!(error)).rejects.toBe(error)
    expect(doReAuthenticate).toHaveBeenCalledTimes(1)
  })

  it('isTokenExpired 返回 false 时保持原样抛出（不误判业务错误）', async () => {
    const error = {
      config: {},
      status: 200,
      data: { code: -1, type: 'error', message: '用户名或密码错误' },
    }
    const { interceptor, doReAuthenticate } = createInterceptor({
      isTokenExpired: (err) => err?.data?.type === 'invalid_token',
    })

    await expect(interceptor.rejected!(error)).rejects.toBe(error)
    expect(doReAuthenticate).not.toHaveBeenCalled()
  })
})
