import Stripe from 'stripe'

// Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY
const USE_STRIPE_MOCK = !STRIPE_SECRET_KEY || process.env.NODE_ENV === 'development'

// Initialize Stripe if key is available
let stripe: Stripe | null = null
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  })
}

// Plan configurations
export const PLAN_CONFIGS = {
  basic: {
    stripeId: process.env.STRIPE_BASIC_PLAN_ID || 'mock_basic_plan',
    name: 'Básico',
    price: 2900, // in cents
  },
  professional: {
    stripeId: process.env.STRIPE_PROFESSIONAL_PLAN_ID || 'mock_professional_plan',
    name: 'Profissional',
    price: 5900, // in cents
  },
  enterprise: {
    stripeId: process.env.STRIPE_ENTERPRISE_PLAN_ID || 'mock_enterprise_plan',
    name: 'Empresarial',
    price: 9900, // in cents
  },
}

// Mock data for testing
const mockSubscriptions = new Map<string, any>()
const mockPayments = new Map<string, any>()

// Mock Stripe implementation
class MockStripe {
  subscriptions = {
    create: async (params: any) => {
      const id = `sub_mock_${Date.now()}`
      const subscription = {
        id,
        customer: params.customer,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        items: {
          data: [{
            price: {
              id: params.items[0].price,
            },
          }],
        },
        metadata: params.metadata || {},
      }
      mockSubscriptions.set(id, subscription)
      return subscription
    },

    retrieve: async (id: string) => {
      return mockSubscriptions.get(id) || {
        id,
        status: 'canceled',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      }
    },

    update: async (id: string, params: any) => {
      const subscription = mockSubscriptions.get(id)
      if (subscription) {
        Object.assign(subscription, params)
        return subscription
      }
      throw new Error('Subscription not found')
    },

    cancel: async (id: string) => {
      const subscription = mockSubscriptions.get(id)
      if (subscription) {
        subscription.status = 'canceled'
        subscription.cancel_at_period_end = true
        return subscription
      }
      throw new Error('Subscription not found')
    },
  }

  paymentIntents = {
    create: async (params: any) => {
      const id = `pi_mock_${Date.now()}`
      const paymentIntent = {
        id,
        client_secret: `pi_mock_secret_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        status: 'succeeded',
        metadata: params.metadata || {},
      }
      mockPayments.set(id, paymentIntent)
      return paymentIntent
    },

    retrieve: async (id: string) => {
      return mockPayments.get(id) || {
        id,
        status: 'succeeded',
        amount: 0,
        currency: 'brl',
      }
    },
  }

  customers = {
    create: async (params: any) => {
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name,
        metadata: params.metadata || {},
      }
    },

    retrieve: async (id: string) => {
      return {
        id,
        email: 'mock@example.com',
        name: 'Mock Customer',
      }
    },
  }

  prices = {
    create: async (params: any) => {
      return {
        id: `price_mock_${Date.now()}`,
        unit_amount: params.unit_amount,
        currency: params.currency,
        recurring: params.recurring,
        metadata: params.metadata || {},
      }
    },

    retrieve: async (id: string) => {
      return {
        id,
        unit_amount: 2900,
        currency: 'brl',
        recurring: { interval: 'month' },
      }
    },
  }

  webhooks = {
    constructEvent: (payload: string, signature: string, secret: string) => {
      // Mock webhook event
      return {
        id: `evt_mock_${Date.now()}`,
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_mock_123',
            status: 'active',
          },
        },
      }
    },
  }
}

// Use mock or real Stripe
const stripeClient = USE_STRIPE_MOCK ? new MockStripe() : stripe

export { stripeClient as stripe, USE_STRIPE_MOCK }

// Helper functions
export async function createSubscription(planSlug: string, customerId: string, metadata?: any) {
  const planConfig = PLAN_CONFIGS[planSlug as keyof typeof PLAN_CONFIGS]
  if (!planConfig) {
    throw new Error(`Plan ${planSlug} not found`)
  }

  if (!stripeClient) {
    throw new Error('Stripe client not configured')
  }

  try {
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{
        price: planConfig.stripeId,
      }],
      metadata: {
        plan_slug: planSlug,
        ...metadata,
      },
    })

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripeClient) {
    throw new Error('Stripe client not configured')
  }

  try {
    const subscription = await stripeClient.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function createPaymentIntent(amount: number, currency: string = 'brl', metadata?: any) {
  if (!stripeClient) {
    throw new Error('Stripe client not configured')
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export async function createCustomer(email: string, name?: string, metadata?: any) {
  if (!stripeClient) {
    throw new Error('Stripe client not configured')
  }

  try {
    const customer = await stripeClient.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
      },
    })

    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

export function getPublishableKey(): string {
  if (USE_STRIPE_MOCK) {
    return 'pk_test_mock_stripe_key'
  }
  return STRIPE_PUBLISHABLE_KEY || ''
}

export function isStripeConfigured(): boolean {
  return !USE_STRIPE_MOCK
}