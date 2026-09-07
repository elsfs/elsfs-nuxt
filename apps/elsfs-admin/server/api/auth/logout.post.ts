export default defineEventHandler((event) => {
  deleteCookie(event, 'elsfs_token')
  return { ok: true }
})
