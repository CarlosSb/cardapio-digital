import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const { restaurantId, updates } = await request.json()

    if (!restaurantId || !updates) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: restaurantId, updates" },
        { status: 400 }
      )
    }

    // Verificar permissões de admin
    const currentUser = await requireAdmin()

    // Buscar restaurante atual
    const currentRestaurant = await sql`
      SELECT id, name, owner_email FROM restaurants WHERE id = ${restaurantId}
    `

    if (currentRestaurant.length === 0) {
      return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 })
    }

    const restaurant = currentRestaurant[0]

    // Verificar permissões: dono ou admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@cardapiodigital.com']
    const isAdmin = adminEmails.includes(currentUser.email)
    const isOwner = restaurant.owner_email === currentUser.email

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Validar campos permitidos para edição
    const allowedFields = ['name', 'description', 'logo_url', 'menu_display_mode']
    const filteredUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // Validações específicas
        if (key === 'name' && (!value || value.toString().trim().length < 2)) {
          return NextResponse.json({ error: "Nome deve ter pelo menos 2 caracteres" }, { status: 400 })
        }
        if (key === 'menu_display_mode' && !['grid', 'list'].includes(value as string)) {
          return NextResponse.json({ error: "Modo de exibição deve ser 'grid' ou 'list'" }, { status: 400 })
        }
        filteredUpdates[key] = value
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar" }, { status: 400 })
    }

    // Executar atualização
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')

    const values = [restaurantId, ...Object.values(filteredUpdates)]

    await sql`
      UPDATE restaurants
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = $1
    `, values

    // Registrar em audit log
    await sql`
      INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
      VALUES ('update_restaurant', 'restaurant', ${restaurantId}, ${currentUser.id}, ${JSON.stringify({
        updates: filteredUpdates,
        restaurant_name: restaurant.name,
        owner_email: restaurant.owner_email,
        permission_level: isAdmin ? 'admin' : 'owner'
      })})
    `

    return NextResponse.json({
      success: true,
      message: "Restaurante atualizado com sucesso",
      updates: filteredUpdates
    })

  } catch (error: any) {
    console.error("Error updating restaurant:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}