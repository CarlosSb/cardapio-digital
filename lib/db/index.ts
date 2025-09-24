import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Try to load .env file if DATABASE_URL is not set (for development)
if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config({ path: ".env" })
  } catch (error) {
    // dotenv not available or .env not found
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please check your .env file or environment variables.")
}

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })

// Legacy sql export for backward compatibility during migration
export { sql }

// Database query functions
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
    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      restaurant_id: row.restaurant_id,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as Category[]
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
    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image_url: row.image_url,
      image_urls: row.image_urls,
      category_id: row.category_id,
      restaurant_id: row.restaurant_id,
      is_available: row.is_available,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as MenuItem[]
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
    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image_url: row.image_url,
      image_urls: row.image_urls,
      category_id: row.category_id,
      restaurant_id: row.restaurant_id,
      is_available: row.is_available,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as MenuItem[]
  } catch (error) {
    console.error("Error fetching menu items by category:", error)
    return []
  }
}

// Types for existing tables (managed via SQL scripts)
export type Restaurant = {
  id: string
  name: string
  description: string | null
  slug: string
  owner_email: string
  logo_url: string | null
  menu_display_mode: 'grid' | 'list'
  is_blocked: boolean
  blocked_at: Date | null
  blocked_by: string | null
  blocked_reason: string | null
  is_banned: boolean
  banned_at: Date | null
  banned_by: string | null
  banned_reason: string | null
  created_at: Date
  updated_at: Date
}

export type Category = {
  id: string
  name: string
  description: string | null
  restaurant_id: string
  display_order: number
  created_at: Date
  updated_at: Date
}

export type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  image_urls: string[] | null // New field for multiple images
  category_id: string
  restaurant_id: string
  is_available: boolean
  display_order: number
  created_at: Date
  updated_at: Date
}

export type User = {
  id: string
  name: string | null
  email: string
  password_hash: string
  is_blocked: boolean
  blocked_at: Date | null
  blocked_by: string | null
  blocked_reason: string | null
  is_banned: boolean
  banned_at: Date | null
  banned_by: string | null
  banned_reason: string | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  raw_json: any
}