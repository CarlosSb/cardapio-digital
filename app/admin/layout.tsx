import type React from "react"
import { requireAdmin } from "@/lib/auth"
import { AdminHeader } from "@/components/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}