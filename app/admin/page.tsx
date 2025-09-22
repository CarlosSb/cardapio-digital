import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { sql } from "@/lib/db"
import { Users, Building2, DollarSign, TrendingUp, Calendar, Eye } from "lucide-react"

export default async function AdminDashboard() {
  // Get platform statistics
  const [restaurantStats] = await Promise.all([
    sql`
      SELECT
        COUNT(*) as total_restaurants,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_restaurants_30d,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_restaurants_7d
      FROM restaurants
    `
  ])

  const stats = restaurantStats[0]

  // Get recent restaurants
  const recentRestaurants = await sql`
    SELECT id, name, slug, owner_email, created_at
    FROM restaurants
    ORDER BY created_at DESC
    LIMIT 5
  `

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma Cardápio Digital
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Restaurantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_restaurants}</div>
            <p className="text-xs text-muted-foreground">
              Restaurantes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_restaurants_30d}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.new_restaurants_7d} na última semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0</div>
            <p className="text-xs text-muted-foreground">
              Sistema de cobrança em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_restaurants > 0
                ? Math.round((stats.new_restaurants_30d / stats.total_restaurants) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Recentes</CardTitle>
          <CardDescription>
            Últimos restaurantes cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRestaurants.map((restaurant: any) => (
              <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-sm text-muted-foreground">{restaurant.owner_email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {restaurant.slug}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Menu
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Ferramentas administrativas para gestão da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Building2 className="h-6 w-6" />
              <span>Gerenciar Restaurantes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Usuários da Plataforma</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Relatórios Financeiros</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}