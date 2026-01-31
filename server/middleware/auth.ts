import { verifyToken, type JwtPayload } from '~~/server/utils/jwt'

// Extend H3Event to include auth context
declare module 'h3' {
  interface H3EventContext {
    auth?: JwtPayload
  }
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip completely for auth routes to avoid circular issues
  if (path.startsWith('/api/auth/') || path === '/api/health') {
    return
  }

  // Try to extract auth token for all routes (including public)
  // This allows public routes to optionally use auth context
  const token = getCookie(event, 'auth_token')

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      event.context.auth = payload
    }
  }
})
