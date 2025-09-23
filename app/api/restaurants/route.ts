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

    const restaurants = await sql`
      SELECT
        id,
        name,
        slug,
        description,
        owner_email,
        logo_url,
        menu_display_mode,
        is_blocked,
        is_banned,
        created_at
      FROM restaurants
      WHERE owner_email = ${targetEmail}
      ORDER BY created_at DESC
    `

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
