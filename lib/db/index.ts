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

// Types for existing tables (managed via SQL scripts)
export type Restaurant = {
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