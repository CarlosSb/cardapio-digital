import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { name, description, restaurant_id } = await request.json()

    if (!name || !restaurant_id) {
      return NextResponse.json({ success: false, error: "Nome e ID do restaurante são obrigatórios" }, { status: 400 })
    }

    // Verify restaurant ownership
    const restaurants = await sql`
      SELECT id FROM restaurants 
      WHERE id = ${restaurant_id} AND owner_email = ${user.email}
      LIMIT 1
    `

    if (restaurants.length === 0) {
      return NextResponse.json({ success: false, error: "Restaurante não encontrado" }, { status: 404 })
    }

    // Get next display order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order 
      FROM categories 
      WHERE restaurant_id = ${restaurant_id}
    `

    const nextOrder = (maxOrder[0]?.max_order || 0) + 1

    const result = await sql`
      INSERT INTO categories (id, name, description, restaurant_id, display_order, created_at, updated_at)
      VALUES (gen_random_uuid(), ${name}, ${description}, ${restaurant_id}, ${nextOrder}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, category: result[0] })
  } catch (error) {
    console.error("Category creation error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
