import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          orders: true,
        },
      },
    },
  })

  return {
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      enrollmentsCount: u._count.enrollments,
      ordersCount: u._count.orders,
    })),
  }
})
