import { type NextRequest, NextResponse } from "next/server"
import { signOut } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign out API error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
