import type { AuthResponse } from 'api-types/elsfs'

import { createMockToken } from './_mock'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = await readBody<{ email?: string; password?: string; username?: string }>(event)
  // 账号密码登录用 username；兼容旧的 email 字段（注册 / 验证码登录复用本端点）
  const username = (body.username || body.email || '').trim()
  const password = body.password || ''

  if (!username || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      message: 'VALIDATION_ERROR',
    })
  }

  // 演示环境：任意非空凭证均视为登录成功
  await new Promise((resolve) => setTimeout(resolve, 600))

  return {
    token: createMockToken(username),
    user: {
      id: '1',
      name: username,
      username,
      email: username.includes('@') ? username : '',
    },
  }
})
