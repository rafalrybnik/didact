import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml } from '~~/server/utils/sanitize'

const createPageSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().min(1, 'Slug jest wymagany').regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki'),
  contentHtml: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createPageSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if slug is unique
  const existingPage = await prisma.page.findUnique({
    where: { slug: result.data.slug },
  })

  if (existingPage) {
    throw createError({
      statusCode: 409,
      message: 'Strona z tym slugiem już istnieje',
    })
  }

  // Sanitize HTML content
  const data = {
    ...result.data,
    contentHtml: result.data.contentHtml ? sanitizeHtml(result.data.contentHtml) : null,
  }

  const page = await prisma.page.create({
    data,
  })

  return { page }
})
