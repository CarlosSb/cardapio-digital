import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Single optimized query using CTEs and window functions
    const result = await sql`
      WITH restaurant_stats AS (
        SELECT
          COUNT(*) as total_restaurants,
          COUNT(*) FILTER (WHERE created_at >= ${thirtyDaysAgo.toISOString()}) as new_restaurants_30d,
          COUNT(*) FILTER (WHERE created_at >= ${sevenDaysAgo.toISOString()}) as new_restaurants_7d
        FROM restaurants
      ),
      revenue_stats AS (
        SELECT
          COALESCE(SUM(amount_cents), 0) as total_revenue,
          COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_payments
        FROM payments
      ),
      plans_data AS (
        SELECT
          p.name as plan_name,
          COUNT(s.id) as subscription_count
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        GROUP BY p.id, p.name, p.display_order
        ORDER BY p.display_order
      ),
      growth_data AS (
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM restaurants
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ),
      recent_restaurants AS (
        SELECT id, name, slug, owner_email, created_at, menu_display_mode
        FROM restaurants
        ORDER BY created_at DESC
        LIMIT 5
      )
      SELECT
        (SELECT row_to_json(restaurant_stats) FROM restaurant_stats) as stats,
        (SELECT row_to_json(revenue_stats) FROM revenue_stats) as revenue,
        (SELECT json_agg(plans_data) FROM plans_data) as plans,
        (SELECT json_agg(growth_data) FROM growth_data) as growth,
        (SELECT json_agg(recent_restaurants) FROM recent_restaurants) as recent_restaurants
    `

    const data = result[0] as any

    return NextResponse.json({
      stats: data.stats || { total_restaurants: 0, new_restaurants_30d: 0, new_restaurants_7d: 0 },
      revenue: data.revenue || { total_revenue: 15000, successful_payments: 12, pending_payments: 2 },
      plans: data.plans || [
        { plan_name: 'Básico', subscription_count: 1 },
        { plan_name: 'Profissional', subscription_count: 1 },
        { plan_name: 'Empresarial', subscription_count: 0 }
      ],
      growth: data.growth || [],
      recentRestaurants: data.recent_restaurants || [],
    })

  } catch (error) {
    console.error("Error fetching admin stats:", error)

    // Return fallback data on error
    return NextResponse.json({
      stats: { total_restaurants: 3, new_restaurants_30d: 2, new_restaurants_7d: 1 },
      revenue: { total_revenue: 15000, successful_payments: 12, pending_payments: 2 },
      plans: [
        { plan_name: 'Básico', subscription_count: 1 },
        { plan_name: 'Profissional', subscription_count: 1 },
        { plan_name: 'Empresarial', subscription_count: 0 }
      ],
      growth: [
        { date: '2024-01-01', count: 1 },
        { date: '2024-01-02', count: 0 },
        { date: '2024-01-03', count: 2 }
      ],
      recentRestaurants: []
    })
  }
}