import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')

  if (!courseId) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu jest wymagane',
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

  const body = await readBody(event)

  const result = createModuleSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // If order not provided, get the next order
  let order = result.data.order
  if (order === undefined) {
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    })
    order = lastModule ? lastModule.order + 1 : 0
  }

  const module = await prisma.module.create({
    data: {
      courseId,
      title: result.data.title,
      order,
    },
  })

  return { module }
})
