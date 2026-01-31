import { verifyToken } from '~~/server/utils/jwt'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Only apply to admin API routes
  if (!path.startsWith('/api/admin')) {
    return
  }

  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Sesja wygasła',
    })
  }

  if (payload.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień administratora',
    })
  }

  // Set auth context
  event.context.auth = payload
})
