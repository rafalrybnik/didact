import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { hashPassword } from '~~/server/utils/password'
import { signToken } from '~~/server/utils/jwt'
import { createAuthRateLimiter } from '~~/server/utils/rateLimit'

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
  name: z.string().min(2, 'Imię musi mieć minimum 2 znaki').optional(),
})

const rateLimiter = createAuthRateLimiter()

export default defineEventHandler(async (event) => {
  // Rate limiting
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rateLimit = rateLimiter.check(ip)

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: 'Zbyt wiele prób rejestracji. Spróbuj ponownie za chwilę.',
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { email, password, name } = result.data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Użytkownik z tym adresem email już istnieje',
    })
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

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
    user,
    message: 'Rejestracja zakończona sukcesem',
  }
})
