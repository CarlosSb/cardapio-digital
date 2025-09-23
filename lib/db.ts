import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types based on the existing schema
export interface Restaurant {
  id: string
  name: string
  description: string | null
  slug: string
  owner_email: string
  logo_url: string | null
  menu_display_mode: 'grid' | 'list'
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  description: string | null
  restaurant_id: string
  display_order: number
  created_at: Date
  updated_at: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  image_urls: string[] | null
  category_id: string
  restaurant_id: string
  is_available: boolean
  display_order: number
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  name: string | null
  email: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  raw_json: any
}

export interface MenuItemWithCategory extends MenuItem {
  category_name: string
}

export async function getRestaurantByOwner(ownerEmail: string): Promise<Restaurant | null> {
  try {
    const result = await sql`
      SELECT * FROM restaurants
      WHERE owner_email = ${ownerEmail}
      LIMIT 1
    `
    return (result[0] as Restaurant) || null
  } catch (error) {
    console.error("Error fetching restaurant by owner:", error)
    return null
  }
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  try {
    const result = await sql`
      SELECT * FROM restaurants
      WHERE slug = ${slug}
      LIMIT 1
    `
    return (result[0] as Restaurant) || null
  } catch (error) {
    console.error("Error fetching restaurant by slug:", error)
    return null
  }
}

export async function getCategoriesByRestaurant(restaurantId: string): Promise<Category[]> {
  try {
    const result = await sql`
      SELECT * FROM categories
      WHERE restaurant_id = ${restaurantId}
      ORDER BY display_order ASC, created_at ASC
    `
    return result as Category[]
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
  try {
    const result = await sql`
      SELECT * FROM menu_items
      WHERE restaurant_id = ${restaurantId}
      ORDER BY display_order ASC, created_at ASC
    `
    return result as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return []
  }
}

export async function getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  try {
    const result = await sql`
      SELECT * FROM menu_items
      WHERE category_id = ${categoryId}
      AND is_available = TRUE
      ORDER BY display_order ASC, created_at ASC
    `
    return result as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items by category:", error)
    return []
  }
}
