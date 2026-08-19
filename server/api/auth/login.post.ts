import { createMockToken } from './_mock'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = (body.email || '').trim()
  const password = body.password || ''

  if (!email || !password) {
    throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity', message: 'VALIDATION_ERROR' })
  }

  // 演示环境：任意非空凭证均视为登录成功
  await new Promise(resolve => setTimeout(resolve, 600))

  return {
    token: createMockToken(email),
    user: {
      id: '1',
      name: email.split('@')[0] || 'user',
      email,
    },
  }
})
