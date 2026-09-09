export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, scene?: string }>(event)
  const email = (body.email || '').trim()

  if (!email) {
    throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity', message: 'VALIDATION_ERROR' })
  }

  // 演示环境：不真实发送，模拟延迟后成功
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    ok: true,
    // 演示用：任何输入都返回固定验证码，便于前端联调
    code: '123456',
  }
})
