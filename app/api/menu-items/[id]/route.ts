import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { name, description, price, image_url, category_id, is_available } = await request.json()
    const itemId = params.id

    if (!name || !price || !category_id) {
      return NextResponse.json({ success: false, error: "Nome, preço e categoria são obrigatórios" }, { status: 400 })
    }

    // Verify menu item ownership through restaurant
    const menuItems = await sql`
      SELECT m.* FROM menu_items m
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE m.id = ${itemId} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (menuItems.length === 0) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 })
    }

    // Verify category belongs to same restaurant
    const categories = await sql`
      SELECT c.* FROM categories c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.id = ${category_id} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Categoria não encontrada" }, { status: 404 })
    }

    const result = await sql`
      UPDATE menu_items 
      SET name = ${name}, description = ${description}, price = ${price}, 
          image_url = ${image_url}, category_id = ${category_id}, 
          is_available = ${is_available}, updated_at = NOW()
      WHERE id = ${itemId}
      RETURNING *
    `

    return NextResponse.json({ success: true, menuItem: result[0] })
  } catch (error) {
    console.error("Menu item update error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const itemId = params.id

    // Verify menu item ownership through restaurant
    const menuItems = await sql`
      SELECT m.* FROM menu_items m
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE m.id = ${itemId} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (menuItems.length === 0) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 })
    }

    await sql`DELETE FROM menu_items WHERE id = ${itemId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu item deletion error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
