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