import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const auth = event.context.auth

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug jest wymagany',
    })
  }

  // Get course
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      structureMode: true,
      enforceSequential: true,
      modules: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
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
    },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check if course is published (or user is admin)
  const isAdmin = auth?.role === 'ADMIN'
  if (course.status !== 'PUBLISHED' && !isAdmin) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check enrollment
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

  // If not enrolled and not admin, return limited info
  if (!isEnrolled && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Musisz być zapisany na kurs',
    })
  }

  // Get user's progress
  const allLessonIds: string[] = []
  course.modules.forEach(m => {
    m.lessons.forEach(l => allLessonIds.push(l.id))
  })
  course.lessons.forEach(l => allLessonIds.push(l.id))

  let progressMap: Record<string, boolean> = {}
  if (auth?.userId && allLessonIds.length > 0) {
    const progress = await prisma.progress.findMany({
      where: {
        userId: auth.userId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    })
    progressMap = progress.reduce((acc, p) => {
      acc[p.lessonId] = true
      return acc
    }, {} as Record<string, boolean>)
  }

  // Build curriculum with progress
  const completedCount = Object.keys(progressMap).length
  const totalLessons = allLessonIds.length

  // Determine which lessons are unlocked (if sequential)
  const unlockedLessons = new Set<string>()
  if (course.enforceSequential) {
    let previousCompleted = true
    // Process modules first
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (previousCompleted) {
          unlockedLessons.add(lesson.id)
        }
        previousCompleted = progressMap[lesson.id] || false
      }
    }
    // Then standalone lessons
    for (const lesson of course.lessons) {
      if (previousCompleted) {
        unlockedLessons.add(lesson.id)
      }
      previousCompleted = progressMap[lesson.id] || false
    }
  } else {
    // All lessons unlocked
    allLessonIds.forEach(id => unlockedLessons.add(id))
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      structureMode: course.structureMode,
      enforceSequential: course.enforceSequential,
    },
    modules: course.modules.map(m => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map(l => ({
        id: l.id,
        title: l.title,
        order: l.order,
        completed: progressMap[l.id] || false,
        unlocked: unlockedLessons.has(l.id),
      })),
    })),
    standaloneLessons: course.lessons.map(l => ({
      id: l.id,
      title: l.title,
      order: l.order,
      completed: progressMap[l.id] || false,
      unlocked: unlockedLessons.has(l.id),
    })),
    progress: {
      completed: completedCount,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
    },
  }
})
