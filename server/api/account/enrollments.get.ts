import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  // Get user's enrollments with course info and progress
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: auth.userId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          status: true,
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const lessonIds = await prisma.lesson.findMany({
        where: { courseId: enrollment.courseId },
        select: { id: true },
      })

      const completedCount = await prisma.progress.count({
        where: {
          userId: auth.userId,
          lessonId: { in: lessonIds.map(l => l.id) },
          completed: true,
        },
      })

      const totalLessons = lessonIds.length
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      return {
        id: enrollment.id,
        enrolledAt: enrollment.createdAt,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          slug: enrollment.course.slug,
          thumbnailUrl: enrollment.course.thumbnailUrl,
          status: enrollment.course.status,
          totalLessons,
        },
        progress: {
          completed: completedCount,
          total: totalLessons,
          percentage,
        },
      }
    })
  )

  return {
    enrollments: enrollmentsWithProgress,
  }
})
