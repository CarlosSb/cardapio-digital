import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdminApi } from "@/lib/auth"

export async function POST() {
  try {
    // Check admin access
    await requireAdminApi()

    // Execute migration SQL
    const migrationSQL = `
      -- Add moderation fields to users table
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS blocked_by UUID,
      ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS banned_by UUID,
      ADD COLUMN IF NOT EXISTS banned_reason TEXT;

      -- Add moderation fields to restaurants table
      ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS blocked_by UUID,
      ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS banned_by UUID,
      ADD COLUMN IF NOT EXISTS banned_reason TEXT;

      -- Create audit_logs table if it doesn't exist
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        performed_by UUID,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);
      CREATE INDEX IF NOT EXISTS idx_restaurants_is_blocked ON restaurants(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_restaurants_is_banned ON restaurants(is_banned);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
    `

    // Execute the migration
    await sql.unsafe(migrationSQL)

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully"
    })

  } catch (error: any) {
    console.error("Migration error:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check admin access
    await requireAdminApi()

    // Check if moderation columns exist
    const checkColumns = await sql`
      SELECT
        column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('is_blocked', 'is_banned')
      ORDER BY column_name
    `

    const hasModerationColumns = checkColumns.length >= 2

    return NextResponse.json({
      success: true,
      migrationStatus: {
        hasModerationColumns,
        columnsFound: checkColumns.map(c => c.column_name)
      }
    })

  } catch (error: any) {
    console.error("Migration check error:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar status da migração",
      details: error.message
    }, { status: 500 })
  }
}