import type { AuthUser } from 'api-types/elsfs'

import { parseMockToken } from './_mock'

export default defineEventHandler((event): AuthUser => {
  const token = getCookie(event, 'elsfs_token')
  const subject = parseMockToken(token)

  if (!subject) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'UNAUTHORIZED' })
  }

  return {
    id: '1',
    name: subject,
    username: subject,
    email: subject.includes('@') ? subject : '',
  }
})
