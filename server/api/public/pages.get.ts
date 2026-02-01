import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const pages = await prisma.page.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  })

  return { pages }
})
