import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { is_available } = await request.json()
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

    const result = await sql`
      UPDATE menu_items 
      SET is_available = ${is_available}, updated_at = NOW()
      WHERE id = ${itemId}
      RETURNING *
    `

    return NextResponse.json({ success: true, menuItem: result[0] })
  } catch (error) {
    console.error("Menu item toggle error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
