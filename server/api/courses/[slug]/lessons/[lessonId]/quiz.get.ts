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

  // Get quiz without correct answers
  const quiz = await prisma.quiz.findFirst({
    where: {
      lessonId,
      lesson: {
        courseId: course.id,
      },
    },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          questionText: true,
          options: true,
          order: true,
          // correctOption is NOT included - hidden from student
        },
      },
    },
  })

  if (!quiz) {
    return { quiz: null }
  }

  // Get user's attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: auth.userId,
      quizId: quiz.id,
    },
    orderBy: { createdAt: 'desc' },
  })

  const attemptsCount = attempts.length
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(a => a.score))
    : null
  const hasPassed = attempts.some(a => a.passed)

  // Check if can retry
  const canRetry = quiz.maxRetries === 0 || attemptsCount < quiz.maxRetries

  return {
    quiz: {
      id: quiz.id,
      lessonId: quiz.lessonId,
      passingScore: quiz.passingScore,
      maxRetries: quiz.maxRetries,
      questions: quiz.questions,
    },
    attempts: {
      count: attemptsCount,
      bestScore,
      hasPassed,
      canRetry,
      remaining: quiz.maxRetries === 0 ? null : quiz.maxRetries - attemptsCount,
    },
  }
})
