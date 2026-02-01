import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '~~/server/utils/prisma'
import { sendEmail } from '~~/server/utils/email'
import { passwordResetTemplate } from '~~/server/utils/emailTemplates'

const schema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
})

// Token expires in 1 hour
const TOKEN_EXPIRY_MINUTES = 60

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

  const { email } = result.data
  const normalizedEmail = email.toLowerCase().trim()

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true },
  })

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: 'Jeśli konto istnieje, wyślemy email z linkiem do resetu hasła.',
    }
  }

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  // Generate new token
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

  // Save token
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  })

  // Build reset URL
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  // Send email
  const emailContent = passwordResetTemplate({
    userName: user.name || '',
    resetUrl,
    expiresInMinutes: TOKEN_EXPIRY_MINUTES,
  })

  await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  })

  return {
    success: true,
    message: 'Jeśli konto istnieje, wyślemy email z linkiem do resetu hasła.',
  }
})
