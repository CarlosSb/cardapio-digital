"use client"

import { Building2, Users, BarChart3, Settings, Shield, DollarSign, PieChart, Activity, LogOut, ChefHat } from "lucide-react"
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

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/admin",
  },
  {
    title: "Restaurantes",
    icon: Building2,
    url: "/admin/restaurants",
  },
  {
    title: "Usuários",
    icon: Users,
    url: "/admin/users",
  },
  {
    title: "Planos",
    icon: PieChart,
    url: "/admin/plans",
  },
  {
    title: "Relatórios",
    icon: DollarSign,
    url: "/admin/reports",
  },
  {
    title: "Moderação",
    icon: Shield,
    url: "/admin/moderation",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-sidebar-foreground">Admin</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Painel Administrativo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarMenu>
            {adminMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Meus Restaurantes">
              <Link href="/dashboard" prefetch={false}>
                <ChefHat />
                <span>Meus Restaurantes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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