import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { direction } = await request.json()
    const categoryId = params.id

    if (!["up", "down"].includes(direction)) {
      return NextResponse.json({ success: false, error: "Direção inválida" }, { status: 400 })
    }

    // Get current category with restaurant verification
    const categories = await sql`
      SELECT c.*, r.owner_email FROM categories c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.id = ${categoryId} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Categoria não encontrada" }, { status: 404 })
    }

    const currentCategory = categories[0]
    const currentOrder = currentCategory.display_order

    // Find the category to swap with
    const targetOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    const targetCategories = await sql`
      SELECT * FROM categories 
      WHERE restaurant_id = ${currentCategory.restaurant_id} AND display_order = ${targetOrder}
      LIMIT 1
    `

    if (targetCategories.length === 0) {
      return NextResponse.json({ success: false, error: "Não é possível mover nesta direção" }, { status: 400 })
    }

    const targetCategory = targetCategories[0]

    // Swap display orders
    await sql`
      UPDATE categories 
      SET display_order = ${targetOrder}, updated_at = NOW()
      WHERE id = ${categoryId}
    `

    await sql`
      UPDATE categories 
      SET display_order = ${currentOrder}, updated_at = NOW()
      WHERE id = ${targetCategory.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Category reorder error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
