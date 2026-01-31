import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Brak slug strony',
    })
  }

  const page = await prisma.page.findUnique({
    where: { slug },
  })

  if (!page) {
    throw createError({
      statusCode: 404,
      message: 'Strona nie istnieje',
    })
  }

  if (!page.published) {
    throw createError({
      statusCode: 404,
      message: 'Strona nie jest opublikowana',
    })
  }

  return {
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      contentHtml: page.contentHtml,
      metaDescription: page.metaDescription,
    },
  }
})
