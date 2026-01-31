import { prisma } from '~~/server/utils/prisma'
import { verifyToken } from '~~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Nie jesteś zalogowany',
    })
  }

  const payload = verifyToken(token)
  if (!payload) {
    // Clear invalid cookie
    deleteCookie(event, 'auth_token')
    throw createError({
      statusCode: 401,
      message: 'Sesja wygasła, zaloguj się ponownie',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) {
    deleteCookie(event, 'auth_token')
    throw createError({
      statusCode: 401,
      message: 'Użytkownik nie istnieje',
    })
  }

  return { user }
})
