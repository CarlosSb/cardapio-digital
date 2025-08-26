import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Tags, Menu, QrCode } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Get statistics
  const [restaurantCount, categoryCount, menuItemCount] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM restaurants WHERE owner_email = ${user.email}`,
    sql`SELECT COUNT(*) as count FROM categories c 
        JOIN restaurants r ON c.restaurant_id = r.id 
        WHERE r.owner_email = ${user.email}`,
    sql`SELECT COUNT(*) as count FROM menu_items m 
        JOIN restaurants r ON m.restaurant_id = r.id 
        WHERE r.owner_email = ${user.email}`,
  ])

  const stats = [
    {
      title: "Restaurantes",
      value: restaurantCount[0]?.count || 0,
      description: "Restaurantes cadastrados",
      icon: Building2,
      href: "/dashboard/restaurant",
    },
    {
      title: "Categorias",
      value: categoryCount[0]?.count || 0,
      description: "Categorias do cardápio",
      icon: Tags,
      href: "/dashboard/categories",
    },
    {
      title: "Itens do Cardápio",
      value: menuItemCount[0]?.count || 0,
      description: "Pratos cadastrados",
      icon: Menu,
      href: "/dashboard/menu-items",
    },
    {
      title: "QR Code",
      value: "Gerar",
      description: "Código QR do cardápio",
      icon: QrCode,
      href: "/dashboard/qr-code",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo, {user.name || user.email}! Gerencie seu cardápio digital.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
