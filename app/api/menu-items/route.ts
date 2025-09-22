import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { canAddMenuItem } from "@/lib/plan-limits"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { name, description, price, image_url, category_id, restaurant_id, is_available } = await request.json()

    if (!name || !price || !category_id || !restaurant_id) {
      return NextResponse.json(
        { success: false, error: "Nome, preço, categoria e restaurante são obrigatórios" },
        { status: 400 },
      )
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

    // Check plan limits
    const canAdd = await canAddMenuItem(restaurant_id)
    if (!canAdd) {
      return NextResponse.json({
        success: false,
        error: "Limite de itens do cardápio atingido. Faça upgrade do seu plano para adicionar mais itens."
      }, { status: 403 })
    }

    // Verify category belongs to restaurant
    const categories = await sql`
      SELECT id FROM categories 
      WHERE id = ${category_id} AND restaurant_id = ${restaurant_id}
      LIMIT 1
    `

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Categoria não encontrada" }, { status: 404 })
    }

    // Get next display order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order 
      FROM menu_items 
      WHERE category_id = ${category_id}
    `

    const nextOrder = (maxOrder[0]?.max_order || 0) + 1

    const result = await sql`
      INSERT INTO menu_items (
        id, name, description, price, image_url, category_id, restaurant_id, 
        is_available, display_order, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), ${name}, ${description}, ${price}, ${image_url}, 
        ${category_id}, ${restaurant_id}, ${is_available}, ${nextOrder}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, menuItem: result[0] })
  } catch (error) {
    console.error("Menu item creation error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
