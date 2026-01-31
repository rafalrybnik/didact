import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const slug = getRouterParam(event, 'slug')
  const lessonId = getRouterParam(event, 'lessonId')

  if (!slug || !lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Brak wymaganych parametrów',
    })
  }

  // Check course and enrollment
  const course = await prisma.course.findUnique({
    where: { slug },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie istnieje',
    })
  }

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
      message: 'Nie masz dostępu do tego kursu',
    })
  }

  // Get homework
  const homework = await prisma.homework.findFirst({
    where: {
      lessonId,
      lesson: {
        courseId: course.id,
      },
    },
  })

  if (!homework) {
    return { homework: null, submission: null }
  }

  // Get user's submission
  const submission = await prisma.submission.findFirst({
    where: {
      userId: auth.userId,
      homeworkId: homework.id,
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    homework: {
      id: homework.id,
      lessonId: homework.lessonId,
      prompt: homework.prompt,
      allowFile: homework.allowFile,
      allowText: homework.allowText,
    },
    submission: submission
      ? {
          id: submission.id,
          contentText: submission.contentText,
          fileUrl: submission.fileUrl,
          status: submission.status,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
          createdAt: submission.createdAt,
        }
      : null,
  }
})
