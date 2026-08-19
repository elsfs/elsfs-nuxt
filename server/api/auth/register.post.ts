import { createMockToken } from './_mock'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, email?: string, password?: string }>(event)
  const username = (body.username || '').trim()
  const email = (body.email || '').trim()
  const password = body.password || ''

  if (!username || !email || !password) {
    throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity', message: 'VALIDATION_ERROR' })
  }

  // 演示环境：直接注册成功并返回令牌
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    token: createMockToken(email),
    user: {
      id: '2',
      name: username,
      email,
    },
  }
})
