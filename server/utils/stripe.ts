import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  })

  return stripeClient
}

export function formatPrice(amount: number, currency: string = 'PLN'): string {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  })
  return formatter.format(amount / 100)
}
