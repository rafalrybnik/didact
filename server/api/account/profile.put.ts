import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Imię jest wymagane').max(100),
  avatarUrl: z.string().url().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const body = await readBody(event)
  const result = updateProfileSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { name, avatarUrl } = result.data

  const updatedUser = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      name,
      avatarUrl: avatarUrl || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
    },
  })

  return {
    user: updatedUser,
  }
})
