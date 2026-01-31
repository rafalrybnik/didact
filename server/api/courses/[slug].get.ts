import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug jest wymagany',
    })
  }

  // Get course with modules and lessons count
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
        },
      },
      lessons: {
        where: { moduleId: null },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
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
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check if course is published (or user is admin)
  const auth = event.context.auth
  const isAdmin = auth?.role === 'ADMIN'

  if (course.status !== 'PUBLISHED' && !isAdmin) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check enrollment if user is logged in
  let isEnrolled = false
  let enrollment = null

  if (auth?.userId) {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.userId,
          courseId: course.id,
        },
      },
    })
    isEnrolled = !!enrollment
  }

  // Calculate total lessons
  const totalLessons = course._count.lessons

  // Get first lesson for "Start Course" button
  let firstLessonId: string | null = null
  if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
    firstLessonId = course.modules[0].lessons[0].id
  } else if (course.lessons.length > 0) {
    firstLessonId = course.lessons[0].id
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
      status: course.status,
      structureMode: course.structureMode,
      enforceSequential: course.enforceSequential,
      totalLessons,
      totalStudents: course._count.enrollments,
      firstLessonId,
      modules: course.modules.map(m => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessonsCount: m.lessons.length,
      })),
    },
    isEnrolled,
    isAdmin,
  }
})
