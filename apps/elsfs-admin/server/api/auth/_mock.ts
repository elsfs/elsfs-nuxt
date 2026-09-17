/**
 * 演示用 mock token 工具。
 * token 格式：mock.<base64url(subject)>.<随机串>
 *
 * subject 既可能是用户名（账号密码登录），也可能是邮箱（注册 / 验证码登录），
 * 因此这里不做邮箱格式校验。
 */
export function createMockToken(subject: string): string {
  const encoded = Buffer.from(subject).toString('base64url')
  return `mock.${encoded}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function parseMockToken(token: string | null | undefined): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'mock' || !parts[1]) return null
  try {
    const subject = Buffer.from(parts[1], 'base64url').toString('utf8')
    return subject || null
  } catch {
    return null
  }
}
