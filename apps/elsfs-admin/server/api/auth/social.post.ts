import { createMockToken } from './_mock'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ provider?: string }>(event)
  const provider = body.provider || 'github'

  // 演示环境：模拟第三方 OAuth 回调后返回令牌
  await new Promise(resolve => setTimeout(resolve, 600))

  const email = `${provider}-user@example.com`

  return {
    token: createMockToken(email),
    user: {
      id: `social-${provider}`,
      name: `${provider} 用户`,
      email,
    },
  }
})
