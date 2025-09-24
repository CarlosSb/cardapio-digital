import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, reason } = await request.json()

    if (!restaurantId || !reason) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: restaurantId, reason" },
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

    // Validações rigorosas para banimento
    if (restaurant.is_banned) {
      return NextResponse.json(
        { error: "Restaurante já está banido - ação irreversível" },
        { status: 400 }
      )
    }

    // Executar banimento (IRREVERSÍVEL)
    const now = new Date()
    await sql`
      UPDATE restaurants
      SET
        is_banned = true,
        banned_at = ${now},
        banned_by = ${currentUser.id},
        banned_reason = ${reason},
        is_blocked = false,
        blocked_at = NULL,
        blocked_by = NULL,
        blocked_reason = NULL
      WHERE id = ${restaurantId}
    `

    // Registrar em audit log com alta prioridade
    await sql`
      INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
      VALUES ('ban_restaurant', 'restaurant', ${restaurantId}, ${currentUser.id}, ${JSON.stringify({
        reason,
        restaurant_name: restaurant.name,
        owner_email: restaurant.owner_email,
        permanent: true,
        irreversible: true,
        previous_status: {
          is_blocked: restaurant.is_blocked,
          is_banned: restaurant.is_banned
        }
      })})
    `

    return NextResponse.json({
      success: true,
      message: "Restaurante banido permanentemente com sucesso",
      warning: "Esta ação é irreversível"
    })

  } catch (error: any) {
    console.error("Error banning restaurant:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "REQUIRES_SUPER_ADMIN") {
      return NextResponse.json({ error: "Requer permissões de super admin" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}