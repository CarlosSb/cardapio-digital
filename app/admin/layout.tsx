import type React from "react"
import { requireAdmin } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="text-sm text-muted-foreground">
            Plataforma Cardápio Digital
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}