"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="border-b bg-muted/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="text-sm text-muted-foreground">
            Plataforma Cardápio Digital
          </div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await fetch("/api/auth/signout", { method: "POST" })
            window.location.href = "/login"
          }}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}