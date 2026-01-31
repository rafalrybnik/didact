import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          lessons: true,
          modules: true,
          enrollments: true,
        },
      },
    },
  })

  return { courses }
})
