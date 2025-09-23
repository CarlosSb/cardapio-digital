import { config } from "dotenv"
import { db } from "./index"
import { platformUsers, menuViews, analyticsEvents } from "./schema"

// Load environment variables
config({ path: ".env" })

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...")

  try {
    // Create platform admin (ignore if exists)
    const adminUser = await db.insert(platformUsers).values({
      email: "admin@cardapiodigital.com",
      name: "Administrador",
      role: "super_admin",
    }).onConflictDoNothing().returning()

    if (adminUser.length > 0) {
      console.log("✅ Created admin user:", adminUser[0])
    } else {
      console.log("ℹ️ Admin user already exists")
    }
  } catch (error) {
    console.log("⚠️ Error creating admin user (might already exist):", error)
  }

  // Create some basic analytics events for demonstration (only if none exist)
  const existingEvents = await db.select().from(analyticsEvents).limit(1)
  if (existingEvents.length === 0) {
    console.log("ℹ️ Creating sample analytics events...")

    const analyticsData = [
      {
        eventType: "platform_launch",
        eventData: { version: "1.0.0", features: ["landing_page", "admin_panel", "qr_codes"] },
        userId: null,
        restaurantId: null,
      },
      {
        eventType: "admin_login",
        eventData: { source: "web_app" },
        userId: null,
        restaurantId: null,
      }
    ]

    await db.insert(analyticsEvents).values(analyticsData)
    console.log("✅ Created sample analytics events:", analyticsData.length)
  } else {
    console.log("ℹ️ Analytics events already exist")
  }

  // Create some basic menu views for demonstration (only if none exist)
  const existingViews = await db.select().from(menuViews).limit(1)
  if (existingViews.length === 0) {
    console.log("ℹ️ Creating sample menu views...")

    const menuViewsData = []
    const now = new Date()

    // Create sample views for demonstration (using dummy restaurant IDs)
    // Note: These will be cleaned up when real restaurants are created
    for (let i = 0; i < 10; i++) {
      const viewDate = new Date(now)
      viewDate.setDate(viewDate.getDate() - Math.floor(Math.random() * 30))

      menuViewsData.push({
        restaurantId: "00000000-0000-0000-0000-000000000000", // Dummy ID
        viewedAt: viewDate,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (compatible; RestaurantBot/1.0)",
        deviceType: Math.random() > 0.5 ? "mobile" : "desktop",
        browser: Math.random() > 0.5 ? "Chrome" : "Safari",
      })
    }

    if (menuViewsData.length > 0) {
      await db.insert(menuViews).values(menuViewsData)
      console.log("✅ Created sample menu views:", menuViewsData.length)
    }
  } else {
    console.log("ℹ️ Menu views already exist")
  }

  console.log("🎉 Database seeding completed successfully!")
  console.log("")
  console.log("📋 Next steps:")
  console.log("1. Run: psql $DATABASE_URL -f scripts/004-seed-data.sql")
  console.log("2. This will populate users, restaurants, categories, and menu items")
  console.log("3. Then run: npm run dev")
  console.log("4. Access /admin with admin@cardapiodigital.com")
}