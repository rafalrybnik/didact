import { sendEmail, verifyEmailConnection } from '~~/server/utils/email'
import { passwordResetTemplate } from '~~/server/utils/emailTemplates'

export default defineEventHandler(async (event) => {
  // Check admin auth
  const auth = event.context.auth
  if (!auth || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  // Verify connection first
  const connected = await verifyEmailConnection()
  if (!connected) {
    throw createError({
      statusCode: 500,
      message: 'Nie można połączyć się z serwerem SMTP',
    })
  }

  // Send test email
  const testEmail = passwordResetTemplate({
    userName: 'Admin',
    resetUrl: 'https://example.com/reset?token=test123',
    expiresInMinutes: 60,
  })

  const sent = await sendEmail({
    to: auth.email || 'test@localhost',
    subject: '[TEST] ' + testEmail.subject,
    html: testEmail.html,
  })

  if (!sent) {
    throw createError({
      statusCode: 500,
      message: 'Nie udało się wysłać emaila testowego',
    })
  }

  return {
    success: true,
    message: `Email testowy wysłany na ${auth.email}`,
  }
})
