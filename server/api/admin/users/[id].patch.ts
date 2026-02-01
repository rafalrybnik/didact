import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').optional(),
  role: z.enum(['ADMIN', 'STUDENT']).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID użytkownika jest wymagane',
    })
  }

  const body = await readBody(event)
  const result = updateUserSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'Użytkownik nie został znaleziony',
    })
  }

  // Prevent removing admin role from yourself (optional safety measure)
  const auth = event.context.auth
  if (auth?.userId === id && result.data.role === 'STUDENT' && existingUser.role === 'ADMIN') {
    throw createError({
      statusCode: 400,
      message: 'Nie możesz zmienić własnej roli na studenta',
    })
  }

  const user = await prisma.user.update({
    where: { id },
    data: result.data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  return { user }
})
