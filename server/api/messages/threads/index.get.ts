import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  // Get threads for user or all threads for admin
  const whereClause = auth.role === 'ADMIN'
    ? {} // Admin sees all threads
    : { userId: auth.userId }

  const threads = await prisma.thread.findMany({
    where: whereClause,
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
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          readAt: true,
          senderId: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              readAt: null,
              senderId: {
                not: auth.userId,
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return {
    threads: threads.map(thread => ({
      id: thread.id,
      subject: thread.subject,
      user: thread.user,
      admin: thread.admin,
      lastMessage: thread.messages[0] || null,
      unreadCount: thread._count.messages,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    })),
  }
})
