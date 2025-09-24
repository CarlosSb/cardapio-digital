"use client"

import { useState, useEffect } from "react"
import { Building2, Home, Menu, Tags, QrCode, LogOut, ChefHat, Crown, Shield, Settings } from "lucide-react"
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
  SidebarGroup,
  SidebarGroupLabel,
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
    title: "Planos",
    url: "/dashboard/plans",
    icon: Crown,
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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          setIsAdmin(true)
        }
      } catch (error) {
        // User is not admin
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-sidebar-primary" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-sidebar-foreground">Cardápio Digital</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Painel Administrativo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Painel Admin">
                <Link href="/admin" prefetch={false}>
                  <Shield />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
