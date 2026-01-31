import { prisma } from '~~/server/utils/prisma'

// One-time endpoint to promote a user to admin
// DELETE THIS FILE AFTER USE
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, secret } = body

  // Simple secret to prevent unauthorized access
  if (secret !== 'promote-admin-2024') {
    throw createError({
      statusCode: 403,
      message: 'Invalid secret',
    })
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })

  return { success: true, user }
})
