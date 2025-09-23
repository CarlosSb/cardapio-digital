import { config } from "dotenv"
import { seedDatabase } from "../lib/db/seed"

// Load environment variables from .env file
config({ path: "../.env" })

async function main() {
  try {
    console.log("🌱 Starting database seeding...")
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set")

    await seedDatabase()
    console.log("✅ Seed completed successfully!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

main()