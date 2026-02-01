import { prisma } from '~~/server/utils/prisma'

interface DailySales {
  date: string
  revenue: number
  orders: number
}

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get all orders in parallel
  const [
    completedOrders,
    totalUsers,
    totalCourses,
    totalEnrollments,
    recentEnrollments,
    activeUsers,
    courseStats,
    completionStats,
  ] = await Promise.all([
    // Completed orders for revenue calculation
    prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),

    // Total users count
    prisma.user.count(),

    // Total published courses
    prisma.course.count({
      where: { status: 'PUBLISHED' },
    }),

    // Total enrollments
    prisma.enrollment.count(),

    // Enrollments in last 7 days
    prisma.enrollment.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    }),

    // Active users (logged in or made progress in last 7 days)
    prisma.progress.findMany({
      where: {
        updatedAt: { gte: sevenDaysAgo },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    }),

    // Course popularity (enrollments per course)
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: {
        enrollments: { _count: 'desc' },
      },
      take: 5,
    }),

    // Course completion stats
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        lessons: {
          select: { id: true },
        },
        enrollments: {
          select: {
            userId: true,
          },
        },
      },
    }),
  ])

  // Calculate daily sales for chart
  const dailySalesMap = new Map<string, { revenue: number; orders: number }>()

  // Initialize all 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailySalesMap.set(dateStr, { revenue: 0, orders: 0 })
  }

  // Fill in actual data
  for (const order of completedOrders) {
    const dateStr = order.createdAt.toISOString().split('T')[0]
    const existing = dailySalesMap.get(dateStr)
    if (existing) {
      existing.revenue += order.amount
      existing.orders += 1
    }
  }

  const dailySales: DailySales[] = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }))

  // Calculate total revenue
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0)
  const weeklyRevenue = completedOrders
    .filter(o => o.createdAt >= sevenDaysAgo)
    .reduce((sum, o) => sum + o.amount, 0)

  // Popular courses
  const popularCourses = courseStats.map(c => ({
    id: c.id,
    title: c.title,
    enrollments: c._count.enrollments,
  }))

  // Course completion rates
  const courseCompletionRates = await Promise.all(
    completionStats.slice(0, 5).map(async (course) => {
      if (course.enrollments.length === 0 || course.lessons.length === 0) {
        return {
          id: course.id,
          title: course.title,
          completionRate: 0,
        }
      }

      const lessonIds = course.lessons.map(l => l.id)
      const userIds = course.enrollments.map(e => e.userId)

      // Get completed lessons per user
      const completedProgress = await prisma.progress.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          lessonId: { in: lessonIds },
          completed: true,
        },
        _count: {
          lessonId: true,
        },
      })

      // Count users who completed all lessons
      const completedUsers = completedProgress.filter(
        p => p._count.lessonId === lessonIds.length
      ).length

      return {
        id: course.id,
        title: course.title,
        completionRate: Math.round((completedUsers / course.enrollments.length) * 100),
      }
    })
  )

  return {
    stats: {
      totalRevenue,
      weeklyRevenue,
      totalUsers,
      totalCourses,
      totalEnrollments,
      recentEnrollments,
      activeUsers: activeUsers.length,
    },
    dailySales,
    popularCourses,
    courseCompletionRates,
  }
})
