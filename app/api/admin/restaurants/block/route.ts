import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, action, reason } = await request.json()

    if (!restaurantId || !action || !reason) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: restaurantId, action, reason" },
        { status: 400 }
      )
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json(
        { error: "Ação deve ser 'block' ou 'unblock'" },
        { status: 400 }
      )
    }

    // Verificar se as colunas de moderação existem
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'restaurants' AND column_name IN ('is_blocked', 'is_banned')
    `

    const hasModerationColumns = columnCheck.length >= 2

    if (!hasModerationColumns) {
      return NextResponse.json({
        error: "Sistema de moderação não inicializado. Execute a migração primeiro."
      }, { status: 500 })
    }

    // Verificar permissões de super admin
    const currentUser = await requireSuperAdmin()

    // Buscar restaurante alvo
    const targetRestaurant = await sql`
      SELECT id, name, owner_email, is_blocked, is_banned FROM restaurants WHERE id = ${restaurantId}
    `

    if (targetRestaurant.length === 0) {
      return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 })
    }

    const restaurant = targetRestaurant[0]

    // Validações
    if (restaurant.is_banned) {
      return NextResponse.json(
        { error: "Restaurante banido não pode ser bloqueado/desbloqueado" },
        { status: 400 }
      )
    }

    // Executar ação
    const now = new Date()
    if (action === 'block') {
      await sql`
        UPDATE restaurants
        SET is_blocked = true, blocked_at = ${now}, blocked_by = ${currentUser.id}, blocked_reason = ${reason}
        WHERE id = ${restaurantId}
      `
    } else {
      await sql`
        UPDATE restaurants
        SET is_blocked = false, blocked_at = NULL, blocked_by = NULL, blocked_reason = NULL
        WHERE id = ${restaurantId}
      `
    }

    // Registrar em audit log
    await sql`
      INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
      VALUES (${action === 'block' ? 'block_restaurant' : 'unblock_restaurant'}, 'restaurant', ${restaurantId}, ${currentUser.id}, ${JSON.stringify({
        reason,
        restaurant_name: restaurant.name,
        owner_email: restaurant.owner_email,
        previous_status: restaurant.is_blocked,
        new_status: action === 'block'
      })})
    `

    return NextResponse.json({
      success: true,
      message: `Restaurante ${action === 'block' ? 'bloqueado' : 'desbloqueado'} com sucesso`
    })

  } catch (error: any) {
    console.error("Error blocking/unblocking restaurant:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "REQUIRES_SUPER_ADMIN") {
      return NextResponse.json({ error: "Requer permissões de super admin" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}