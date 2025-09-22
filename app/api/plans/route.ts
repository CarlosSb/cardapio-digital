import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get current plan
    let currentPlan = null
    try {
      const currentPlanResult = await sql`
        SELECT
          p.id,
          p.name,
          p.slug,
          p.price_cents,
          p.features,
          s.status,
          s.current_period_start,
          s.current_period_end
        FROM plans p
        JOIN subscriptions s ON p.id = s.plan_id
        WHERE s.restaurant_id = (
          SELECT id FROM restaurants WHERE owner_email = ${user.email} LIMIT 1
        )
        AND s.status = 'active'
        LIMIT 1
      `
      currentPlan = currentPlanResult[0]
    } catch (error) {
      console.warn("Current plan query failed:", error)
    }

    // Get available plans
    let availablePlans = []
    try {
      const plansResult = await sql`
        SELECT
          id,
          name,
          slug,
          description,
          price_cents,
          features
        FROM plans
        WHERE is_active = true
        ORDER BY display_order
      `
      availablePlans = plansResult
    } catch (error) {
      console.warn("Available plans query failed, using defaults:", error)
      // Fallback to default plans
      availablePlans = [
        {
          id: 'basic',
          name: 'Básico',
          slug: 'basic',
          description: 'Perfeito para restaurantes pequenos',
          price_cents: 2900,
          features: { menu_items_limit: 50, analytics: false, api_access: false, multiple_units: false }
        },
        {
          id: 'professional',
          name: 'Profissional',
          slug: 'professional',
          description: 'Para restaurantes em crescimento',
          price_cents: 5900,
          features: { menu_items_limit: -1, analytics: true, api_access: false, multiple_units: false }
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          slug: 'enterprise',
          description: 'Para redes e grandes operações',
          price_cents: 9900,
          features: { menu_items_limit: -1, analytics: true, api_access: true, multiple_units: true }
        }
      ]
    }

    // Get usage stats
    let usage = { menu_items_count: 0, views_30d: 0 }
    try {
      const usageResult = await sql`
        SELECT
          (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = (
            SELECT id FROM restaurants WHERE owner_email = ${user.email} LIMIT 1
          )) as menu_items_count,
          (SELECT COUNT(*) FROM menu_views WHERE restaurant_id = (
            SELECT id FROM restaurants WHERE owner_email = ${user.email} LIMIT 1
          ) AND viewed_at >= CURRENT_DATE - INTERVAL '30 days') as views_30d
      `
      usage = usageResult[0] as { menu_items_count: number; views_30d: number }
    } catch (error) {
      console.warn("Usage stats query failed:", error)
    }

    return NextResponse.json({
      currentPlan,
      availablePlans,
      usage
    })

  } catch (error) {
    console.error("Plans API error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}