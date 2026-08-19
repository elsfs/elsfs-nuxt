import { parseMockToken } from './_mock'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'elsfs_token')
  const email = parseMockToken(token)

  if (!email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'UNAUTHORIZED' })
  }

  return {
    id: '1',
    name: email.split('@')[0] || 'user',
    email,
  }
})
