import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { getStripe } from '~~/server/utils/stripe'

const createSessionSchema = z.object({
  courseSlug: z.string(),
  invoiceData: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    nip: z.string().optional(),
  }).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany, aby dokonać zakupu',
    })
  }

  const body = await readBody(event)
  const result = createSessionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { courseSlug, invoiceData } = result.data

  // Get course
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie istnieje',
    })
  }

  if (course.status !== 'PUBLISHED') {
    throw createError({
      statusCode: 400,
      message: 'Kurs nie jest dostępny do zakupu',
    })
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: auth.userId,
        courseId: course.id,
      },
    },
  })

  if (existingEnrollment) {
    throw createError({
      statusCode: 400,
      message: 'Już posiadasz dostęp do tego kursu',
    })
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Użytkownik nie istnieje',
    })
  }

  // If course is free, create enrollment directly
  if (course.price === 0) {
    await prisma.enrollment.create({
      data: {
        userId: auth.userId,
        courseId: course.id,
      },
    })

    return {
      success: true,
      free: true,
      redirectUrl: `/course/${course.slug}`,
    }
  }

  // Create Stripe checkout session
  const stripe = getStripe()
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create order first
  const order = await prisma.order.create({
    data: {
      userId: auth.userId,
      courseId: course.id,
      amount: course.price,
      currency: course.currency,
      invoiceData: invoiceData || null,
      status: 'PENDING',
    },
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'blik', 'p24'],
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: order.id,
    line_items: [
      {
        price_data: {
          currency: course.currency.toLowerCase(),
          product_data: {
            name: course.title,
            description: course.description || undefined,
            images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
          },
          unit_amount: course.price,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/c/${course.slug}`,
    metadata: {
      orderId: order.id,
      courseId: course.id,
      userId: auth.userId,
    },
  })

  // Update order with session ID
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  })

  return {
    success: true,
    free: false,
    sessionId: session.id,
    sessionUrl: session.url,
  }
})
