import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const ownerEmail = searchParams.get('owner_email')

    // If owner_email is provided, filter by it (for admin viewing user restaurants)
    // Otherwise, return user's own restaurants
    const targetEmail = ownerEmail || user.email

    console.log("🔍 Fetching restaurants for email:", targetEmail, "by user:", user.email)

    // Check if moderation columns exist
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'restaurants' AND column_name IN ('is_blocked', 'is_banned')
    `

    console.log("📊 Restaurant moderation columns found:", columnCheck)

    const hasModerationColumns = columnCheck.length >= 2

    let restaurants

    if (hasModerationColumns) {
      restaurants = await sql`
        SELECT
          id,
          name,
          slug,
          description,
          owner_email,
          logo_url,
          menu_display_mode,
          created_at,
          is_blocked,
          is_banned
        FROM restaurants
        WHERE owner_email = ${targetEmail}
        ORDER BY created_at DESC
      `
    } else {
      restaurants = await sql`
        SELECT
          id,
          name,
          slug,
          description,
          owner_email,
          logo_url,
          menu_display_mode,
          created_at
        FROM restaurants
        WHERE owner_email = ${targetEmail}
        ORDER BY created_at DESC
      `
    }

    console.log("✅ Found restaurants:", restaurants.length, "for email:", targetEmail)
    console.log("📋 Restaurants data:", restaurants)

    // If no restaurants found and this is for testing/debugging, create a test restaurant
    if (restaurants.length === 0 && targetEmail === 'j') {
      console.log("🧪 Creating test restaurant for user 'j'")
      try {
        const testRestaurant = await sql`
          INSERT INTO restaurants (id, name, slug, description, owner_email, logo_url, menu_display_mode, created_at, updated_at)
          VALUES (gen_random_uuid(), 'Restaurante Teste J', 'restaurante-teste-j', 'Restaurante de teste para debug', 'j', 'https://via.placeholder.com/150', 'grid', NOW(), NOW())
          RETURNING id, name, slug, description, owner_email, logo_url, menu_display_mode, created_at
        `

        if (testRestaurant.length > 0) {
          console.log("✅ Test restaurant created:", testRestaurant[0])
          restaurants = testRestaurant
        }
      } catch (error) {
        console.error("❌ Error creating test restaurant:", error)
      }
    }

    return NextResponse.json({ success: true, restaurants })
  } catch (error) {
    console.error("Restaurant fetch error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { name, description, slug, logo_url, owner_email, menu_display_mode } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Nome e slug são obrigatórios" }, { status: 400 })
    }

    // Check if slug already exists
    const existingSlugs = await sql`
      SELECT id FROM restaurants WHERE slug = ${slug} LIMIT 1
    `

    if (existingSlugs.length > 0) {
      return NextResponse.json({ success: false, error: "Este slug já está em uso" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO restaurants (id, name, description, slug, owner_email, logo_url, menu_display_mode, created_at, updated_at)
      VALUES (gen_random_uuid(), ${name}, ${description}, ${slug}, ${owner_email}, ${logo_url}, ${menu_display_mode || 'grid'}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, restaurant: result[0] })
  } catch (error) {
    console.error("Restaurant creation error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { id, name, description, slug, logo_url, menu_display_mode } = await request.json()

    if (!id || !name || !slug) {
      return NextResponse.json({ success: false, error: "ID, nome e slug são obrigatórios" }, { status: 400 })
    }

    // Check if slug already exists for other restaurants
    const existingSlugs = await sql`
      SELECT id FROM restaurants WHERE slug = ${slug} AND id != ${id} LIMIT 1
    `

    if (existingSlugs.length > 0) {
      return NextResponse.json({ success: false, error: "Este slug já está em uso" }, { status: 400 })
    }

    const result = await sql`
      UPDATE restaurants
      SET name = ${name}, description = ${description}, slug = ${slug},
          logo_url = ${logo_url}, menu_display_mode = ${menu_display_mode}, updated_at = NOW()
      WHERE id = ${id} AND owner_email = ${user.email}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Restaurante não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, restaurant: result[0] })
  } catch (error) {
    console.error("Restaurant update error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
