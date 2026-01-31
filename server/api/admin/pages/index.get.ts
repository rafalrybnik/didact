import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return { pages }
})
