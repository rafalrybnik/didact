import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const query = getQuery(event)
  const status = query.status as string | undefined
  const courseId = query.courseId as string | undefined

  const whereClause: any = {}

  if (status) {
    whereClause.status = status
  }

  if (courseId) {
    whereClause.homework = {
      lesson: {
        courseId,
      },
    }
  }

  const submissions = await prisma.submission.findMany({
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
      homework: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // PENDING first
      { createdAt: 'desc' },
    ],
  })

  return { submissions }
})
