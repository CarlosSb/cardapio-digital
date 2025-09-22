import { sql } from "../lib/db"

async function assignTestPlans() {
  try {
    console.log("🎯 Atribuindo planos aos usuários de teste...")

    // Get all restaurants
    const restaurants = await sql`
      SELECT id, name, owner_email FROM restaurants ORDER BY created_at
    `

    console.log(`📊 Encontrados ${restaurants.length} restaurantes`)

    // Assign plans based on restaurant order (cycling through available plans)
    const plans = ['basic', 'professional', 'enterprise']

    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i]
      const planSlug = plans[i % plans.length]

      console.log(`🏷️  Atribuindo plano ${planSlug} para ${restaurant.name}`)

      // Get plan details
      const planResult = await sql`
        SELECT id, name, price_cents FROM plans WHERE slug = ${planSlug} LIMIT 1
      `

      if (planResult.length === 0) {
        console.warn(`⚠️  Plano ${planSlug} não encontrado, pulando...`)
        continue
      }

      const plan = planResult[0]

      // Check if restaurant already has an active subscription
      const existingSubscription = await sql`
        SELECT id FROM subscriptions
        WHERE restaurant_id = ${restaurant.id} AND status = 'active'
        LIMIT 1
      `

      if (existingSubscription.length > 0) {
        console.log(`⏭️  Restaurante ${restaurant.name} já tem uma assinatura ativa, pulando...`)
        continue
      }

      // Create subscription
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
          ${restaurant.id},
          ${plan.id},
          ${`mock_sub_${restaurant.id}_${Date.now()}`},
          'active',
          ${currentDate.toISOString()},
          ${nextMonth.toISOString()},
          NOW(),
          NOW()
        )
      `

      // Create payment record
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
          ${restaurant.id},
          (SELECT id FROM subscriptions WHERE restaurant_id = ${restaurant.id} AND status = 'active' ORDER BY created_at DESC LIMIT 1),
          ${`pi_mock_${restaurant.id}_${Date.now()}`},
          ${plan.price_cents},
          'BRL',
          'succeeded',
          'card',
          ${`Assinatura do plano ${plan.name} - Teste`},
          NOW(),
          NOW()
        )
      `

      console.log(`✅ Plano ${plan.name} atribuído a ${restaurant.name}`)
    }

    console.log("🎉 Atribuição de planos concluída!")
    console.log("\n📋 Resumo:")
    console.log(`   - Restaurantes processados: ${restaurants.length}`)
    console.log(`   - Planos atribuídos: Básico, Profissional, Empresarial (alternados)`)

  } catch (error) {
    console.error("❌ Erro ao atribuir planos:", error)
    process.exit(1)
  }
}

assignTestPlans()