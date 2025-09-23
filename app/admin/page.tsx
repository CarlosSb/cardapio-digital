import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { sql } from "@/lib/db"
import { Users, Building2, DollarSign, TrendingUp, Calendar, Eye, BarChart3, PieChart, Activity } from "lucide-react"
// import { AdminCharts } from "@/components/admin-charts" // Temporarily disabled due to recharts SSR issues

export default async function AdminDashboard() {
  // Get platform statistics
  let stats = { total_restaurants: 0, new_restaurants_30d: 0, new_restaurants_7d: 0 }
  let revenue = { total_revenue: 0, successful_payments: 0, pending_payments: 0 }
  let plans = []
  let growth = []

  // Try to get restaurant stats
  try {
    const restaurantStats = await sql`
      SELECT
        COUNT(*) as total_restaurants,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_restaurants_30d,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_restaurants_7d
      FROM restaurants
    `
    stats = restaurantStats[0] as any
  } catch (error) {
    console.warn("Restaurant stats query failed:", error)
  }

  // Try to get revenue stats
  try {
    const revenueStats = await sql`
      SELECT
        COALESCE(SUM(amount_cents), 0) as total_revenue,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payments
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `
    revenue = revenueStats[0] as any
  } catch (error) {
    console.warn("Revenue stats query failed:", error)
  }

  // Try to get plan stats
  try {
    const planStats = await sql`
      SELECT
        p.name as plan_name,
        COUNT(s.id) as subscription_count
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
      GROUP BY p.id, p.name, p.display_order
      ORDER BY p.display_order
    `
    plans = planStats as any
  } catch (error) {
    console.warn("Plan stats query failed, using default data:", error)
    // Fallback data if tables don't exist
    plans = [
      { plan_name: 'Básico', subscription_count: 0 },
      { plan_name: 'Profissional', subscription_count: 0 },
      { plan_name: 'Empresarial', subscription_count: 0 }
    ]
  }

  // Try to get growth data
  try {
    const growthData = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM restaurants
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `
    growth = growthData as any
  } catch (error) {
    console.warn("Growth data query failed:", error)
    growth = []
  }

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
            <CardTitle className="text-sm font-medium">Receita (30 dias)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(revenue.total_revenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {revenue.successful_payments} pagamentos confirmados
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

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Crescimento de Restaurantes (30 dias)
            </CardTitle>
            <CardDescription>
              Novos cadastros por dia nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráficos temporariamente indisponíveis
            </div>
          </CardContent>
        </Card>

        {/* Plans Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Planos
            </CardTitle>
            <CardDescription>
              Assinaturas ativas por plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Charts are rendered in the first card */}
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

      {/* Revenue and Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Faturamento e Pagamentos
          </CardTitle>
          <CardDescription>
            Visão geral das receitas e status dos pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Receita Total (30 dias)</p>
              <p className="text-2xl font-bold">R$ {(revenue.total_revenue / 100).toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pagamentos Confirmados</p>
              <p className="text-2xl font-bold text-green-600">{revenue.successful_payments}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{revenue.pending_payments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Planos</CardTitle>
          <CardDescription>
            Controle dos planos de assinatura e suas assinaturas ativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan: any) => (
              <div key={plan.plan_name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{plan.plan_name}</p>
                  <p className="text-sm text-muted-foreground">{plan.subscription_count} assinaturas ativas</p>
                </div>
                <Badge variant={plan.subscription_count > 0 ? "default" : "secondary"}>
                  {plan.subscription_count > 0 ? "Ativo" : "Inativo"}
                </Badge>
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