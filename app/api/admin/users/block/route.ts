import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, action, reason } = await request.json()

    if (!userId || !action || !reason) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: userId, action, reason" },
        { status: 400 }
      )
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json(
        { error: "Ação deve ser 'block' ou 'unblock'" },
        { status: 400 }
      )
    }

    // Verificar permissões de super admin
    const currentUser = await requireSuperAdmin()

    // Verificar se as colunas de moderação existem
    console.log("🔍 Checking moderation columns...")
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('is_blocked', 'is_banned')
    `

    console.log("📊 Column check result:", columnCheck)
    const hasModerationColumns = columnCheck.length >= 2
    console.log("✅ Has moderation columns:", hasModerationColumns)

    if (!hasModerationColumns) {
      console.error("❌ Moderation columns not found!")
      return NextResponse.json({
        error: "Sistema de moderação não inicializado. Execute a migração primeiro.",
        details: {
          foundColumns: columnCheck.map(c => c.column_name),
          expectedColumns: ['is_blocked', 'is_banned']
        }
      }, { status: 500 })
    }

    // Buscar usuário alvo
    const targetUser = await sql`
      SELECT id, email, is_blocked, is_banned FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = targetUser[0]

    // Validações
    if (user.is_banned) {
      return NextResponse.json(
        { error: "Usuário banido não pode ser bloqueado/desbloqueado" },
        { status: 400 }
      )
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Não é possível bloquear a si mesmo" },
        { status: 400 }
      )
    }

    // Executar ação
    const now = new Date()
    if (action === 'block') {
      await sql`
        UPDATE users
        SET is_blocked = true, blocked_at = ${now}, blocked_by = ${currentUser.id}, blocked_reason = ${reason}
        WHERE id = ${userId}
      `
    } else {
      await sql`
        UPDATE users
        SET is_blocked = false, blocked_at = NULL, blocked_by = NULL, blocked_reason = NULL
        WHERE id = ${userId}
      `
    }

    // Registrar em audit log
    await sql`
      INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details)
      VALUES (${action === 'block' ? 'block_user' : 'unblock_user'}, 'user', ${userId}, ${currentUser.id}, ${JSON.stringify({
        reason,
        previous_status: user.is_blocked,
        new_status: action === 'block'
      })})
    `

    return NextResponse.json({
      success: true,
      message: `Usuário ${action === 'block' ? 'bloqueado' : 'desbloqueado'} com sucesso`
    })

  } catch (error: any) {
    console.error("Error blocking/unblocking user:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "REQUIRES_SUPER_ADMIN") {
      return NextResponse.json({ error: "Requer permissões de super admin" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}