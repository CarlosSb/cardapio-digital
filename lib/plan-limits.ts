import { sql } from "@/lib/db"

// Plan limit configurations
export const PLAN_LIMITS = {
  basic: {
    menuItemsLimit: 50,
    analytics: false,
    apiAccess: false,
    multipleUnits: false,
  },
  professional: {
    menuItemsLimit: -1, // unlimited
    analytics: true,
    apiAccess: false,
    multipleUnits: false,
  },
  enterprise: {
    menuItemsLimit: -1, // unlimited
    analytics: true,
    apiAccess: true,
    multipleUnits: true,
  },
}

// Get current plan for a restaurant
export async function getCurrentPlan(restaurantId: string) {
  const result = await sql`
    SELECT
      p.slug,
      p.features,
      s.status
    FROM plans p
    JOIN subscriptions s ON p.id = s.plan_id
    WHERE s.restaurant_id = ${restaurantId}
    AND s.status = 'active'
    LIMIT 1
  `

  if (result.length === 0) {
    // No active plan, return basic limits
    return {
      slug: 'basic',
      features: PLAN_LIMITS.basic,
      status: 'none',
    }
  }

  return {
    slug: result[0].slug,
    features: result[0].features,
    status: result[0].status,
  }
}

// Check if restaurant can add menu item
export async function canAddMenuItem(restaurantId: string): Promise<boolean> {
  const plan = await getCurrentPlan(restaurantId)

  if (!plan.features) {
    // Fallback to basic limits
    return await checkMenuItemLimit(restaurantId, PLAN_LIMITS.basic.menuItemsLimit)
  }

  const limit = plan.features.menu_items_limit
  if (limit === -1) {
    return true // unlimited
  }

  return await checkMenuItemLimit(restaurantId, limit)
}

// Check menu item limit
async function checkMenuItemLimit(restaurantId: string, limit: number): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM menu_items
    WHERE restaurant_id = ${restaurantId}
  `

  const currentCount = result[0]?.count || 0
  return currentCount < limit
}

// Get usage statistics for a restaurant
export async function getUsageStats(restaurantId: string) {
  const [menuItemsCount, viewsCount] = await Promise.all([
    sql`
      SELECT COUNT(*) as count
      FROM menu_items
      WHERE restaurant_id = ${restaurantId}
    `,
    sql`
      SELECT COUNT(*) as count
      FROM menu_views
      WHERE restaurant_id = ${restaurantId}
      AND viewed_at >= CURRENT_DATE - INTERVAL '30 days'
    `
  ])

  return {
    menuItemsCount: menuItemsCount[0]?.count || 0,
    viewsCount30d: viewsCount[0]?.count || 0,
  }
}

// Validate plan limits before operations
export async function validatePlanLimits(restaurantId: string, operation: 'add_menu_item' | 'view_analytics' | 'use_api' | 'add_unit') {
  const plan = await getCurrentPlan(restaurantId)

  switch (operation) {
    case 'add_menu_item':
      return await canAddMenuItem(restaurantId)

    case 'view_analytics':
      return plan.features?.analytics === true

    case 'use_api':
      return plan.features?.api_access === true

    case 'add_unit':
      return plan.features?.multiple_units === true

    default:
      return false
  }
}

// Get plan limits for display
export function getPlanLimits(planSlug: string) {
  return PLAN_LIMITS[planSlug as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.basic
}

// Check if plan has feature
export function planHasFeature(planSlug: string, feature: keyof typeof PLAN_LIMITS.basic): boolean {
  const limits = getPlanLimits(planSlug)
  return limits[feature] === true
}

// Get menu items limit for plan
export function getMenuItemsLimit(planSlug: string): number {
  const limits = getPlanLimits(planSlug)
  return limits.menuItemsLimit
}