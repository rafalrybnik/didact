import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const lessonId = event.context.params?.lessonId
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  if (!slug || !lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Parametry są wymagane',
    })
  }

  // Get course
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      enforceSequential: true,
    },
  })

  if (!course || course.status !== 'PUBLISHED') {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: auth.userId,
        courseId: course.id,
      },
    },
  })

  if (!enrollment) {
    throw createError({
      statusCode: 403,
      message: 'Musisz być zapisany na kurs',
    })
  }

  // Get lesson
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId: course.id,
    },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  // Check if previous lessons are completed (if sequential mode)
  if (course.enforceSequential) {
    const allLessons = await prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
      select: { id: true },
    })

    const progress = await prisma.progress.findMany({
      where: {
        userId: auth.userId,
        lessonId: { in: allLessons.map(l => l.id) },
        completed: true,
      },
      select: { lessonId: true },
    })
    const completedSet = new Set(progress.map(p => p.lessonId))

    for (const l of allLessons) {
      if (l.id === lessonId) break
      if (!completedSet.has(l.id)) {
        throw createError({
          statusCode: 403,
          message: 'Musisz ukończyć poprzednie lekcje',
        })
      }
    }
  }

  // Create or update progress
  const existingProgress = await prisma.progress.findFirst({
    where: {
      userId: auth.userId,
      lessonId: lessonId,
    },
  })

  if (existingProgress) {
    if (!existingProgress.completed) {
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      })
    }
  } else {
    await prisma.progress.create({
      data: {
        userId: auth.userId,
        lessonId: lessonId,
        completed: true,
        completedAt: new Date(),
      },
    })
  }

  // Get updated progress stats
  const allLessonIds = await prisma.lesson.findMany({
    where: { courseId: course.id },
    select: { id: true },
  })

  const completedCount = await prisma.progress.count({
    where: {
      userId: auth.userId,
      lessonId: { in: allLessonIds.map(l => l.id) },
      completed: true,
    },
  })

  return {
    success: true,
    progress: {
      completed: completedCount,
      total: allLessonIds.length,
      percentage: Math.round((completedCount / allLessonIds.length) * 100),
    },
  }
})
