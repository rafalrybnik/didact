import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml } from '~~/server/utils/sanitize'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().min(1, 'Slug jest wymagany').regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki'),
  description: z.string().optional(),
  salesDescription: z.string().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  price: z.number().int().min(0).default(0),
  currency: z.string().default('PLN'),
  structureMode: z.enum(['MODULAR', 'FLAT', 'FREESTYLE']).default('MODULAR'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  enforceSequential: z.boolean().default(false),
  requireAssignmentPass: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createCourseSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if slug is unique
  const existingCourse = await prisma.course.findUnique({
    where: { slug: result.data.slug },
  })

  if (existingCourse) {
    throw createError({
      statusCode: 409,
      message: 'Kurs z tym slugiem już istnieje',
    })
  }

  // Sanitize HTML content
  const data = {
    ...result.data,
    salesDescription: result.data.salesDescription ? sanitizeHtml(result.data.salesDescription) : undefined,
  }

  const course = await prisma.course.create({
    data,
  })

  return { course }
})
