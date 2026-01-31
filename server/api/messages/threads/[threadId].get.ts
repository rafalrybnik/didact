import { prisma } from '~~/server/utils/prisma'

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
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      messages: {
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
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!thread) {
    throw createError({
      statusCode: 404,
      message: 'Wątek nie istnieje',
    })
  }

  // Check access - user can only see their own threads, admin can see all
  if (auth.role !== 'ADMIN' && thread.userId !== auth.userId) {
    throw createError({
      statusCode: 403,
      message: 'Nie masz dostępu do tego wątku',
    })
  }

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      threadId,
      senderId: { not: auth.userId },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  return { thread }
})
