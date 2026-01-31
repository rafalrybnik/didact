import { prisma } from '~~/server/utils/prisma'
import { getStripe } from '~~/server/utils/stripe'
import type Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Get raw body for signature verification
  const body = await readRawBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Missing request body',
    })
  }

  // Verify webhook signature if secret is configured
  let stripeEvent: Stripe.Event

  if (webhookSecret) {
    const signature = getHeader(event, 'stripe-signature')

    if (!signature) {
      throw createError({
        statusCode: 400,
        message: 'Missing Stripe signature',
      })
    }

    try {
      stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message)
      throw createError({
        statusCode: 400,
        message: 'Invalid signature',
      })
    }
  } else {
    // In development without webhook secret, parse body directly
    stripeEvent = JSON.parse(body) as Stripe.Event
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session

      console.log('Checkout session completed:', session.id)

      // Get order by session ID
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: session.id },
      })

      if (!order) {
        console.error('Order not found for session:', session.id)
        return { received: true }
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          stripePaymentId: session.payment_intent as string,
        },
      })

      // Create enrollment
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
      })

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: order.courseId,
          },
        })
        console.log('Created enrollment for user:', order.userId, 'course:', order.courseId)
      }

      break
    }

    case 'checkout.session.expired': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session

      console.log('Checkout session expired:', session.id)

      // Update order status
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' },
      })

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent

      console.log('Payment failed:', paymentIntent.id)

      // Update order status if we can find it
      await prisma.order.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'FAILED' },
      })

      break
    }

    default:
      console.log('Unhandled event type:', stripeEvent.type)
  }

  return { received: true }
})
