import { NextRequest, NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminApi()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Mock data for demonstration - in real app, fetch from analytics tables
    const mockReports = {
      revenue: {
        total: 15750,
        growth: 12.5,
        chart: [
          { date: "2024-09-01", amount: 1200 },
          { date: "2024-09-02", amount: 1350 },
          { date: "2024-09-03", amount: 1100 },
          { date: "2024-09-04", amount: 1400 },
          { date: "2024-09-05", amount: 1600 },
          { date: "2024-09-06", amount: 1800 },
          { date: "2024-09-07", amount: 1900 },
        ]
      },
      users: {
        total: 245,
        new: 23,
        active: 189,
        chart: [
          { date: "2024-09-01", new: 5, active: 120 },
          { date: "2024-09-02", new: 3, active: 125 },
          { date: "2024-09-03", new: 7, active: 130 },
          { date: "2024-09-04", new: 4, active: 135 },
          { date: "2024-09-05", new: 6, active: 140 },
          { date: "2024-09-06", new: 8, active: 145 },
          { date: "2024-09-07", new: 2, active: 150 },
        ]
      },
      restaurants: {
        total: 45,
        active: 38,
        premium: 12,
        distribution: [
          { name: "Básico", value: 25, color: "#3b82f6" },
          { name: "Profissional", value: 15, color: "#10b981" },
          { name: "Empresarial", value: 5, color: "#f59e0b" },
        ]
      },
      payments: {
        total: 89,
        successful: 85,
        pending: 3,
        failed: 1,
        methods: [
          { method: "Cartão de Crédito", count: 65 },
          { method: "PIX", count: 18 },
          { method: "Boleto", count: 6 },
        ]
      }
    }

    return NextResponse.json(mockReports)
  } catch (error: any) {
    console.error("Error fetching reports:", error)

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}