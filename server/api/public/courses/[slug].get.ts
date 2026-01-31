import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const auth = event.context.auth

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Brak slug kursu',
    })
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          _count: {
            select: { lessons: true },
          },
        },
      },
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie istnieje',
    })
  }

  if (course.status !== 'PUBLISHED') {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie jest dostępny',
    })
  }

  // Check if user is enrolled
  let isEnrolled = false
  if (auth?.userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.userId,
          courseId: course.id,
        },
      },
    })
    isEnrolled = !!enrollment
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      salesDescription: course.salesDescription,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      currency: course.currency,
      lessonsCount: course._count.lessons,
      studentsCount: course._count.enrollments,
      modules: course.modules.map(m => ({
        id: m.id,
        title: m.title,
        lessonsCount: m._count.lessons,
      })),
    },
    isEnrolled,
  }
})
