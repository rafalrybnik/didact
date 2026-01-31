import { verifyToken, type JwtPayload } from '~/server/utils/jwt'

// Extend H3Event to include auth context
declare module 'h3' {
  interface H3EventContext {
    auth?: JwtPayload
  }
}

export default defineEventHandler((event) => {
  // Only apply to protected routes
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip auth check for public routes
  if (
    path.startsWith('/api/auth/') ||
    path === '/api/health' ||
    path.startsWith('/api/public/')
  ) {
    return
  }

  // Skip auth check for admin routes - they have their own protection
  // This middleware just adds auth context
  const token = getCookie(event, 'auth_token')

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      event.context.auth = payload
    }
  }
})
