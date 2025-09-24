import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { getRestaurantByOwner, sql } from "@/lib/db"
import { getCurrentPlan } from "@/lib/plan-limits"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Get restaurant
    const restaurant = await getRestaurantByOwner(user.email)
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 })
    }

    // Check if user has a paid plan
    const plan = await getCurrentPlan(restaurant.id)
    const isPaidPlan = plan && plan.slug !== 'basic' && plan.slug !== 'free'

    if (!isPaidPlan) {
      return NextResponse.json({
        error: "Esta funcionalidade está disponível apenas para planos pagos"
      }, { status: 403 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 })
    }

    // Validate file type (only SVG allowed)
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
      return NextResponse.json({
        error: "Apenas arquivos SVG são permitidos para logos"
      }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({
        error: "Arquivo muito grande. Máximo 2MB permitido"
      }, { status: 400 })
    }

    // Read file content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate SVG content (basic check)
    const content = buffer.toString()
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      return NextResponse.json({
        error: "Arquivo SVG inválido"
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'qr-logos')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, continue
    }

    // Generate unique filename
    const fileExtension = 'svg'
    const fileName = `${restaurant.id}-${randomUUID()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file
    await writeFile(filePath, buffer)

    // Generate public URL
    const logoUrl = `/uploads/qr-logos/${fileName}`

    // Update restaurant with custom logo URL
    await sql`
      UPDATE restaurants
      SET custom_qr_logo_url = ${logoUrl}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${restaurant.id}
    `

    return NextResponse.json({
      success: true,
      message: "Logo personalizado enviado com sucesso",
      logoUrl
    })

  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Get restaurant
    const restaurant = await getRestaurantByOwner(user.email)
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 })
    }

    // Check if user has a paid plan
    const plan = await getCurrentPlan(restaurant.id)
    const isPaidPlan = plan && plan.slug !== 'basic' && plan.slug !== 'free'

    if (!isPaidPlan) {
      return NextResponse.json({
        error: "Esta funcionalidade está disponível apenas para planos pagos"
      }, { status: 403 })
    }

    // Remove custom logo URL from database
    await sql`
      UPDATE restaurants
      SET custom_qr_logo_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${restaurant.id}
    `

    // Note: File deletion from filesystem could be implemented here if needed
    // For now, we just remove the reference from the database

    return NextResponse.json({
      success: true,
      message: "Logo personalizado removido com sucesso"
    })

  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error.message
    }, { status: 500 })
  }
}