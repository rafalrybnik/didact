import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const updatePageSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki').optional(),
  contentHtml: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID strony jest wymagane',
    })
  }

  const body = await readBody(event)

  const result = updatePageSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if page exists
  const existingPage = await prisma.page.findUnique({
    where: { id },
  })

  if (!existingPage) {
    throw createError({
      statusCode: 404,
      message: 'Strona nie została znaleziona',
    })
  }

  // If slug is being updated, check uniqueness
  if (result.data.slug && result.data.slug !== existingPage.slug) {
    const slugExists = await prisma.page.findUnique({
      where: { slug: result.data.slug },
    })

    if (slugExists) {
      throw createError({
        statusCode: 409,
        message: 'Strona z tym slugiem już istnieje',
      })
    }
  }

  const page = await prisma.page.update({
    where: { id },
    data: result.data,
  })

  return { page }
})
