import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createThreadSchema = z.object({
  subject: z.string().min(1, 'Temat jest wymagany').max(200),
  message: z.string().min(1, 'Wiadomość jest wymagana').max(5000),
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
  const result = createThreadSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { subject, message } = result.data

  // Create thread with initial message
  const thread = await prisma.thread.create({
    data: {
      userId: auth.userId,
      subject,
      messages: {
        create: {
          senderId: auth.userId,
          content: message,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      messages: true,
    },
  })

  return { thread }
})
