import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { comparePassword } from '~~/server/utils/password'
import { signToken } from '~~/server/utils/jwt'

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { email, password } = result.data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Nieprawidłowy email lub hasło',
    })
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Nieprawidłowy email lub hasło',
    })
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Set HTTP-only cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    message: 'Logowanie zakończone sukcesem',
  }
})
