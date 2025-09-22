import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { planSlug } = await request.json()

    if (!planSlug) {
      return NextResponse.json(
        { success: false, error: "Slug do plano é obrigatório" },
        { status: 400 }
      )
    }

    // Get restaurant ID
    const restaurantResult = await sql`
      SELECT id FROM restaurants WHERE owner_email = ${user.email} LIMIT 1
    `

    if (restaurantResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Restaurante não encontrado" },
        { status: 404 }
      )
    }

    const restaurantId = restaurantResult[0].id

    // Get plan details
    const planResult = await sql`
      SELECT id, name, price_cents FROM plans WHERE slug = ${planSlug} AND is_active = true LIMIT 1
    `

    if (planResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plano não encontrado" },
        { status: 404 }
      )
    }

    const plan = planResult[0]

    // Check if user already has an active subscription
    const existingSubscription = await sql`
      SELECT id FROM subscriptions
      WHERE restaurant_id = ${restaurantId} AND status = 'active'
      LIMIT 1
    `

    if (existingSubscription.length > 0) {
      // Cancel existing subscription
      await sql`
        UPDATE subscriptions
        SET status = 'canceled', cancel_at_period_end = true, updated_at = NOW()
        WHERE restaurant_id = ${restaurantId} AND status = 'active'
      `
    }

    // Create new subscription (mock for now)
    const currentDate = new Date()
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await sql`
      INSERT INTO subscriptions (
        restaurant_id,
        plan_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
      ) VALUES (
        ${restaurantId},
        ${plan.id},
        ${`mock_sub_${Date.now()}`},
        'active',
        ${currentDate.toISOString()},
        ${nextMonth.toISOString()},
        NOW(),
        NOW()
      )
    `

    // Create payment record (mock)
    await sql`
      INSERT INTO payments (
        restaurant_id,
        subscription_id,
        stripe_payment_intent_id,
        amount_cents,
        currency,
        status,
        payment_method,
        description,
        created_at,
        updated_at
      ) VALUES (
        ${restaurantId},
        (SELECT id FROM subscriptions WHERE restaurant_id = ${restaurantId} AND status = 'active' ORDER BY created_at DESC LIMIT 1),
        ${`pi_mock_${Date.now()}`},
        ${plan.price_cents},
        'BRL',
        'succeeded',
        'card',
        ${`Assinatura do plano ${plan.name}`},
        NOW(),
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: `Plano ${plan.name} ativado com sucesso!`,
      plan: {
        name: plan.name,
        price: (plan.price_cents / 100).toFixed(2)
      }
    })

  } catch (error) {
    console.error("Plan selection error:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}