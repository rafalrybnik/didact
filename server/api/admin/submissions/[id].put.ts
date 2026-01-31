import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const gradeSubmissionSchema = z.object({
  status: z.enum(['PASSED', 'REJECTED']),
  feedback: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Brak ID zgłoszenia',
    })
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      homework: true,
    },
  })

  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Zgłoszenie nie istnieje',
    })
  }

  const body = await readBody(event)
  const result = gradeSubmissionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { status, feedback } = result.data

  const updatedSubmission = await prisma.submission.update({
    where: { id },
    data: {
      status,
      feedback: feedback || null,
      gradedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // If passed, mark lesson as complete
  if (status === 'PASSED') {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: submission.userId,
          lessonId: submission.homework.lessonId,
        },
      },
      create: {
        userId: submission.userId,
        lessonId: submission.homework.lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    })
  }

  return { submission: updatedSubmission }
})
