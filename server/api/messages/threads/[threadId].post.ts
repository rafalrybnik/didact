import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Wiadomość jest wymagana').max(5000),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const threadId = getRouterParam(event, 'threadId')

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Brak ID wątku',
    })
  }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
  })

  if (!thread) {
    throw createError({
      statusCode: 404,
      message: 'Wątek nie istnieje',
    })
  }

  // Check access
  if (auth.role !== 'ADMIN' && thread.userId !== auth.userId) {
    throw createError({
      statusCode: 403,
      message: 'Nie masz dostępu do tego wątku',
    })
  }

  const body = await readBody(event)
  const result = sendMessageSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Create message and update thread
  const message = await prisma.message.create({
    data: {
      threadId,
      senderId: auth.userId,
      content: result.data.content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  })

  // If admin is responding for the first time, assign them to the thread
  if (auth.role === 'ADMIN' && !thread.adminId) {
    await prisma.thread.update({
      where: { id: threadId },
      data: { adminId: auth.userId },
    })
  }

  // Update thread timestamp
  await prisma.thread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  return { message }
})
