"use client"

import { Building2, Home, Menu, Tags, QrCode, LogOut, ChefHat } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Início",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Restaurante",
    url: "/dashboard/restaurant",
    icon: Building2,
  },
  {
    title: "Categorias",
    url: "/dashboard/categories",
    icon: Tags,
  },
  {
    title: "Cardápio",
    url: "/dashboard/menu-items",
    icon: Menu,
  },
  {
    title: "QR Code",
    url: "/dashboard/qr-code",
    icon: QrCode,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Cardápio Digital</h2>
            <p className="text-sm text-sidebar-foreground/70">Painel Administrativo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url} className="w-full justify-start">
                <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button variant="outline" onClick={handleSignOut} className="w-full justify-start gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
