export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = (body.email || '').trim()

  if (!email) {
    throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity', message: 'VALIDATION_ERROR' })
  }

  // 演示环境：不真实发送邮件，模拟延迟后成功
  await new Promise(resolve => setTimeout(resolve, 700))

  return { ok: true }
})
