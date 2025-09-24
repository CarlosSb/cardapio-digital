import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdminApi } from "@/lib/auth"

export async function POST() {
  try {
    // Check admin access
    await requireAdminApi()

    // Execute migration SQL for custom QR logo field
    const migrationSQL = `
      -- Add custom QR logo field to restaurants table
      ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS custom_qr_logo_url TEXT;

      -- Add comment for documentation
      COMMENT ON COLUMN restaurants.custom_qr_logo_url IS 'URL of custom logo for QR codes (paid plans only)';
    `

    // Execute the migration
    await sql.unsafe(migrationSQL)

    return NextResponse.json({
      success: true,
      message: "QR logo field migration completed successfully"
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

    // Check if custom_qr_logo_url column exists
    const checkColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'restaurants'
        AND column_name = 'custom_qr_logo_url'
    `

    const hasCustomQrLogoField = checkColumn.length > 0

    return NextResponse.json({
      success: true,
      migrationStatus: {
        hasCustomQrLogoField,
        columnFound: hasCustomQrLogoField ? checkColumn[0].column_name : null
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