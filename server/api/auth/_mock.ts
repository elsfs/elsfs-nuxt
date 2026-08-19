/**
 * 演示用 mock token 工具。
 * token 格式：mock.<base64url(email)>.<随机串>
 */
export function createMockToken(email: string): string {
  const encoded = Buffer.from(email).toString('base64url')
  return `mock.${encoded}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function parseMockToken(token: string | null | undefined): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'mock' || !parts[1]) return null
  try {
    const email = Buffer.from(parts[1], 'base64url').toString('utf8')
    return email.includes('@') ? email : null
  }
  catch {
    return null
  }
}
