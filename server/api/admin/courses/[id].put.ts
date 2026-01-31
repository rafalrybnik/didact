import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml } from '~~/server/utils/sanitize'
import { optionalUrl } from '~~/server/utils/validation'

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki').optional(),
  description: z.string().optional().nullable(),
  salesDescription: z.string().optional().nullable(),
  thumbnailUrl: optionalUrl,
  price: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  structureMode: z.enum(['MODULAR', 'FLAT', 'FREESTYLE']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  enforceSequential: z.boolean().optional(),
  requireAssignmentPass: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu jest wymagane',
    })
  }

  const body = await readBody(event)

  const result = updateCourseSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if course exists
  const existingCourse = await prisma.course.findUnique({
    where: { id },
  })

  if (!existingCourse) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // If slug is being updated, check uniqueness
  if (result.data.slug && result.data.slug !== existingCourse.slug) {
    const slugExists = await prisma.course.findUnique({
      where: { slug: result.data.slug },
    })

    if (slugExists) {
      throw createError({
        statusCode: 409,
        message: 'Kurs z tym slugiem już istnieje',
      })
    }
  }

  // Sanitize HTML content if provided
  const data = {
    ...result.data,
    ...(result.data.salesDescription !== undefined && {
      salesDescription: result.data.salesDescription ? sanitizeHtml(result.data.salesDescription) : null,
    }),
  }

  const course = await prisma.course.update({
    where: { id },
    data,
  })

  return { course }
})
