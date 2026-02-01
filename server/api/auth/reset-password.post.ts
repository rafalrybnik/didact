import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '~~/server/utils/prisma'

const schema = z.object({
  token: z.string().min(1, 'Token jest wymagany'),
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { token, password } = result.data

  // Find valid token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowy lub wygasły link. Spróbuj ponownie.',
    })
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    throw createError({
      statusCode: 400,
      message: 'Link wygasł. Spróbuj ponownie.',
    })
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 10)

  // Update user password and delete token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ])

  return {
    success: true,
    message: 'Hasło zostało zmienione. Możesz się teraz zalogować.',
  }
})
