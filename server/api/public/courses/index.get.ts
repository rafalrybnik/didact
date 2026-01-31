import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const courses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      price: true,
      currency: true,
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    courses: courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      currency: course.currency,
      lessonsCount: course._count.lessons,
      studentsCount: course._count.enrollments,
    })),
  }
})
