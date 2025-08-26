import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const { name, description } = await request.json()
    const categoryId = params.id

    if (!name) {
      return NextResponse.json({ success: false, error: "Nome é obrigatório" }, { status: 400 })
    }

    // Verify category ownership through restaurant
    const categories = await sql`
      SELECT c.* FROM categories c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.id = ${categoryId} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Categoria não encontrada" }, { status: 404 })
    }

    const result = await sql`
      UPDATE categories 
      SET name = ${name}, description = ${description}, updated_at = NOW()
      WHERE id = ${categoryId}
      RETURNING *
    `

    return NextResponse.json({ success: true, category: result[0] })
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const categoryId = params.id

    // Verify category ownership through restaurant
    const categories = await sql`
      SELECT c.* FROM categories c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.id = ${categoryId} AND r.owner_email = ${user.email}
      LIMIT 1
    `

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Categoria não encontrada" }, { status: 404 })
    }

    // Check if category has menu items
    const menuItems = await sql`
      SELECT COUNT(*) as count FROM menu_items WHERE category_id = ${categoryId}
    `

    if (menuItems[0]?.count > 0) {
      return NextResponse.json(
        { success: false, error: "Não é possível excluir categoria com itens do cardápio" },
        { status: 400 },
      )
    }

    await sql`DELETE FROM categories WHERE id = ${categoryId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Category deletion error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
