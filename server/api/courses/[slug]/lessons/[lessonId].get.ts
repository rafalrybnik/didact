import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const lessonId = event.context.params?.lessonId
  const auth = event.context.auth

  if (!slug || !lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Parametry są wymagane',
    })
  }

  // Get course and verify it exists
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      enforceSequential: true,
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
  let enrollmentDate: Date | null = null
  if (auth?.userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.userId,
          courseId: course.id,
        },
      },
      select: {
        createdAt: true,
      },
    })
    isEnrolled = !!enrollment
    enrollmentDate = enrollment?.createdAt || null
  }

  if (!isEnrolled && !isAdmin) {
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
    include: {
      module: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  // Check if lesson is unlocked (if sequential mode)
  if (course.enforceSequential && auth?.userId) {
    // Get all lessons in order
    const allLessons = await prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
      select: { id: true },
    })

    // Get user's progress
    const progress = await prisma.progress.findMany({
      where: {
        userId: auth.userId,
        lessonId: { in: allLessons.map(l => l.id) },
        completed: true,
      },
      select: { lessonId: true },
    })
    const completedSet = new Set(progress.map(p => p.lessonId))

    // Check if all previous lessons are completed
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

  // Check drip content lock
  if (lesson.dripDays && lesson.dripDays > 0 && enrollmentDate && !isAdmin) {
    const unlockDate = new Date(enrollmentDate)
    unlockDate.setDate(unlockDate.getDate() + lesson.dripDays)
    const now = new Date()
    if (now < unlockDate) {
      throw createError({
        statusCode: 403,
        message: `Ta lekcja będzie dostępna ${unlockDate.toLocaleDateString('pl-PL')}`,
      })
    }
  }

  // Get user's progress for this lesson
  let isCompleted = false
  if (auth?.userId) {
    const progressRecord = await prisma.progress.findFirst({
      where: {
        userId: auth.userId,
        lessonId: lessonId,
      },
    })
    isCompleted = progressRecord?.completed || false
  }

  // Get previous and next lessons for navigation
  const allLessons = await prisma.lesson.findMany({
    where: { courseId: course.id },
    orderBy: [
      { module: { order: 'asc' } },
      { order: 'asc' },
    ],
    select: {
      id: true,
      title: true,
    },
  })

  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      contentHtml: lesson.contentHtml,
      videoUrl: lesson.videoUrl,
      videoIframe: lesson.videoIframe,
      attachments: lesson.attachments,
      module: lesson.module,
      isCompleted,
    },
    navigation: {
      prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
      next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
      currentIndex: currentIndex + 1,
      totalLessons: allLessons.length,
    },
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
    },
  }
})
