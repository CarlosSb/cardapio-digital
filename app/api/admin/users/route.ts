import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdminApi } from "@/lib/auth"

export async function GET() {
  try {
    // Check admin access
    await requireAdminApi()

    const users = await sql`
      SELECT
        id,
        name,
        email,
        created_at,
        is_blocked,
        blocked_at,
        blocked_reason,
        is_banned,
        banned_at,
        banned_reason
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Error fetching users:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}