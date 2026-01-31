import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const submitQuizSchema = z.object({
  answers: z.array(z.number()), // Array of selected option indices
})

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

  // Get quiz with correct answers
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
      },
    },
  })

  if (!quiz) {
    throw createError({
      statusCode: 404,
      message: 'Quiz nie istnieje',
    })
  }

  // Check attempts limit
  const attemptsCount = await prisma.quizAttempt.count({
    where: {
      userId: auth.userId,
      quizId: quiz.id,
    },
  })

  if (quiz.maxRetries > 0 && attemptsCount >= quiz.maxRetries) {
    throw createError({
      statusCode: 400,
      message: 'Wykorzystano limit prób',
    })
  }

  const body = await readBody(event)
  const result = submitQuizSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { answers } = result.data

  // Validate answers count
  if (answers.length !== quiz.questions.length) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowa liczba odpowiedzi',
    })
  }

  // Calculate score
  let correctCount = 0
  const results = quiz.questions.map((question, index) => {
    const userAnswer = answers[index]
    const isCorrect = userAnswer === question.correctOption
    if (isCorrect) correctCount++
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctOption,
      isCorrect,
    }
  })

  const score = Math.round((correctCount / quiz.questions.length) * 100)
  const passed = score >= quiz.passingScore

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: auth.userId,
      quizId: quiz.id,
      score,
      passed,
      answers,
    },
  })

  // If passed, mark lesson as complete
  if (passed) {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: auth.userId,
          lessonId,
        },
      },
      create: {
        userId: auth.userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    })
  }

  return {
    attempt: {
      id: attempt.id,
      score,
      passed,
      results,
    },
    canRetry: quiz.maxRetries === 0 || attemptsCount + 1 < quiz.maxRetries,
    remaining: quiz.maxRetries === 0 ? null : quiz.maxRetries - attemptsCount - 1,
  }
})
