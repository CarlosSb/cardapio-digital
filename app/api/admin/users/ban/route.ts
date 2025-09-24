import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, reason } = await request.json()

    if (!userId || !reason) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: userId, reason" },
        { status: 400 }
      )
    }

    // Verificar se as colunas de moderação existem
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('is_blocked', 'is_banned')
    `

    const hasModerationColumns = columnCheck.length >= 2

    if (!hasModerationColumns) {
      return NextResponse.json({
        error: "Sistema de moderação não inicializado. Execute a migração primeiro."
      }, { status: 500 })
    }

    // Verificar permissões de super admin
    const currentUser = await requireSuperAdmin()

    // Buscar usuário alvo
    const targetUser = await sql`
      SELECT id, email, is_blocked, is_banned FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = targetUser[0]

    // Validações rigorosas para banimento
    if (user.is_banned) {
      return NextResponse.json(
        { error: "Usuário já está banido - ação irreversível" },
        { status: 400 }
      )
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Não é possível banir a si mesmo" },
        { status: 400 }
      )
    }

    // Verificar se é super admin tentando banir outro super admin
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',') || ['admin@cardapiodigital.com']
    if (superAdminEmails.includes(user.email)) {
      return NextResponse.json(
        { error: "Não é possível banir outro super admin" },
        { status: 400 }
      )
    }

    // Executar banimento (IRREVERSÍVEL)
    const now = new Date()
    await sql`
      UPDATE users
      SET
        is_banned = true,
        banned_at = ${now},
        banned_by = ${currentUser.id},
        banned_reason = ${reason},
        is_blocked = false,
        blocked_at = NULL,
        blocked_by = NULL,
        blocked_reason = NULL
      WHERE id = ${userId}
    `

    // Registrar em audit log com alta prioridade
    await sql`
      INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
      VALUES ('ban_user', 'user', ${userId}, ${currentUser.id}, ${JSON.stringify({
        reason,
        permanent: true,
        irreversible: true,
        previous_status: {
          is_blocked: user.is_blocked,
          is_banned: user.is_banned
        }
      })})
    `

    return NextResponse.json({
      success: true,
      message: "Usuário banido permanentemente com sucesso",
      warning: "Esta ação é irreversível"
    })

  } catch (error: any) {
    console.error("Error banning user:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "REQUIRES_SUPER_ADMIN") {
      return NextResponse.json({ error: "Requer permissões de super admin" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}