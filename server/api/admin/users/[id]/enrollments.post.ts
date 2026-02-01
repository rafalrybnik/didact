import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const addEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'ID kursu jest wymagane'),
})

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'ID użytkownika jest wymagane',
    })
  }

  const body = await readBody(event)
  const result = addEnrollmentSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { courseId } = result.data

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Użytkownik nie został znaleziony',
    })
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  })

  if (existingEnrollment) {
    throw createError({
      statusCode: 409,
      message: 'Użytkownik jest już zapisany na ten kurs',
    })
  }

  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
    },
    select: {
      id: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  })

  return { enrollment }
})
