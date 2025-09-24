"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Building2, DollarSign, TrendingUp, Calendar, Eye, BarChart3, PieChart, Activity, Settings, Plus, Shield, Edit } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"
import Link from "next/link"
import { AdminPageSkeleton } from "@/components/skeletons"
import { UserEditModal } from "@/components/user-edit-modal"
import { RestaurantCreateModal } from "@/components/restaurant-create-modal"
import { RestaurantEditModal } from "@/components/restaurant-edit-modal"
import { RestaurantPreviewModal } from "@/components/restaurant-preview-modal"
import { UserRestaurantsModal } from "@/components/user-restaurants-modal"
import { ModerationModal } from "@/components/moderation-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { BlockBanDialog } from "@/components/block-ban-dialog"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_restaurants: 0, new_restaurants_30d: 0, new_restaurants_7d: 0 })
  const [revenue, setRevenue] = useState({ total_revenue: 0, successful_payments: 0, pending_payments: 0 })
  const [plans, setPlans] = useState<Array<{plan_name: string, subscription_count: number}>>([])
  const [growth, setGrowth] = useState<Array<{date: string, count: number}>>([])
  const [recentRestaurants, setRecentRestaurants] = useState<Array<{id: string, name: string, slug: string, owner_email: string, created_at: Date}>>([])
  const [allRestaurants, setAllRestaurants] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showCreateRestaurant, setShowCreateRestaurant] = useState(false)
  const [previewingRestaurant, setPreviewingRestaurant] = useState<any>(null)
  const [viewingUserRestaurants, setViewingUserRestaurants] = useState<any>(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'restaurant' | 'user', item: any} | null>(null)
  const [blockBanDialog, setBlockBanDialog] = useState<{
    type: 'user' | 'restaurant'
    item: any
  } | null>(null)
  const [dataFetched, setDataFetched] = useState(false)

  // Funções para bloqueio/banimento
  const handleBlockBan = async (action: 'block' | 'ban', reason: string) => {
    if (!blockBanDialog) return

    try {
      const endpoint = blockBanDialog.type === 'user'
        ? (action === 'block' ? '/api/admin/users/block' : '/api/admin/users/ban')
        : (action === 'block' ? '/api/admin/restaurants/block' : '/api/admin/restaurants/ban')

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [blockBanDialog.type === 'user' ? 'userId' : 'restaurantId']: blockBanDialog.item.id,
          action: action === 'block' ? (blockBanDialog.item.is_blocked ? 'unblock' : 'block') : 'ban',
          reason
        })
      })

      if (response.ok) {
        // Atualizar listas
        if (blockBanDialog.type === 'user') {
          setAllUsers(prev => prev.map(u =>
            u.id === blockBanDialog.item.id
              ? { ...u, is_blocked: action === 'block' ? !(u as any).is_blocked : false, is_banned: action === 'ban' || (u as any).is_banned }
              : u
          ))
        } else {
          setAllRestaurants(prev => prev.map(r =>
            r.id === blockBanDialog.item.id
              ? { ...r, is_blocked: action === 'block' ? !(r as any).is_blocked : false, is_banned: action === 'ban' || (r as any).is_banned }
              : r
          ))
        }
        setBlockBanDialog(null)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Error blocking/banning:', error)
      alert('Erro ao processar solicitação')
    }
  }

  // Função para editar restaurante
  const handleEditRestaurant = async (updates: Partial<any>) => {
    if (!editingRestaurant) return

    try {
      const response = await fetch('/api/admin/restaurants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: editingRestaurant.id,
          updates
        })
      })

      if (response.ok) {
        setAllRestaurants(prev => prev.map(r =>
          r.id === editingRestaurant.id ? { ...r, ...updates } : r
        ))
        setEditingRestaurant(null)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating restaurant:', error)
      alert('Erro ao atualizar restaurante')
    }
  }

  useEffect(() => {
    // Prevent double execution in development (React Strict Mode)
    if (dataFetched) return

    const fetchData = async () => {
      try {
        // Fetch data from API endpoints (to be created)
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRevenue(data.revenue)
          setPlans(data.plans)
          setGrowth(data.growth)
          setRecentRestaurants(data.recentRestaurants)
        } else {
          // Fallback mock data only for stats
          setStats({ total_restaurants: 3, new_restaurants_30d: 2, new_restaurants_7d: 1 })
          setRevenue({ total_revenue: 15000, successful_payments: 12, pending_payments: 2 })
          setPlans([
            { plan_name: 'Básico', subscription_count: 1 },
            { plan_name: 'Profissional', subscription_count: 1 },
            { plan_name: 'Empresarial', subscription_count: 0 }
          ])
          setGrowth([
            { date: '2024-01-01', count: 1 },
            { date: '2024-01-02', count: 0 },
            { date: '2024-01-03', count: 2 }
          ])
          setRecentRestaurants([
            { id: '1', name: 'Restaurante Sabor Caseiro', slug: 'sabor-caseiro', owner_email: 'joao@email.com', created_at: new Date() }
          ])
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        // Use fallback data only for stats
        setStats({ total_restaurants: 3, new_restaurants_30d: 2, new_restaurants_7d: 1 })
        setRevenue({ total_revenue: 15000, successful_payments: 12, pending_payments: 2 })
        setPlans([
          { plan_name: 'Básico', subscription_count: 1 },
          { plan_name: 'Profissional', subscription_count: 1 },
          { plan_name: 'Empresarial', subscription_count: 0 }
        ])
        setGrowth([
          { date: '2024-01-01', count: 1 },
          { date: '2024-01-02', count: 0 },
          { date: '2024-01-03', count: 2 }
        ])
        setRecentRestaurants([
          { id: '1', name: 'Restaurante Sabor Caseiro', slug: 'sabor-caseiro', owner_email: 'joao@email.com', created_at: new Date() }
        ])
      }

      // ✅ ALWAYS fetch restaurants and users (moved outside try-catch)
      try {
        const restaurantsResponse = await fetch('/api/admin/restaurants')
        if (restaurantsResponse.ok) {
          const restaurants = await restaurantsResponse.json()
          setAllRestaurants(restaurants)
        } else {
          console.error("Failed to fetch restaurants")
          setAllRestaurants([])
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error)
        setAllRestaurants([])
      }

      try {
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const users = await usersResponse.json()
          setAllUsers(users)
        } else {
          console.error("Failed to fetch users")
          setAllUsers([])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setAllUsers([])
      }

      setLoading(false)
      setDataFetched(true)
    }

    fetchData()
  }, [dataFetched])

  if (loading) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma Cardápio Digital
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/migrate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })
                if (response.ok) {
                  alert('Migração executada com sucesso!')
                  window.location.reload()
                } else {
                  const error = await response.json()
                  alert(`Erro na migração: ${error.error}`)
                }
              } catch (error) {
                alert('Erro ao executar migração')
              }
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Executar Migração
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Settings className="h-4 w-4 mr-2" />
              Dashboard Restaurantes
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
           <TabsTrigger value="restaurants">Restaurantes ({allRestaurants.length})</TabsTrigger>
           <TabsTrigger value="users">Usuários ({allUsers.length})</TabsTrigger>
           <TabsTrigger value="plans">Planos</TabsTrigger>
           <TabsTrigger value="reports">Relatórios</TabsTrigger>
         </TabsList>

        <TabsContent value="dashboard" className="space-y-6">

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Growth Chart */}
        <Card className="md:col-span-2">
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value: string) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number) => [value, 'Novos restaurantes']}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={plans}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan_name, subscription_count }: any) => `${plan_name}: ${subscription_count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="subscription_count"
                >
                  {plans.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Statistics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenue.successful_payments > 0
                ? Math.round((revenue.successful_payments / (revenue.successful_payments + revenue.pending_payments)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita por Restaurante</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.total_restaurants > 0
                ? Math.round((revenue.total_revenue / 100) / stats.total_restaurants)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Média por restaurante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_restaurants > 0
                ? Math.round((stats.new_restaurants_7d / stats.total_restaurants) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Atividade semanal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção Mensal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{Math.round(stats.new_restaurants_30d * 1.2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimativa para o próximo mês
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRestaurant(restaurant)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-1" />
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setBlockBanDialog({ type: 'restaurant', item: restaurant })}>
                        <Shield className="h-4 w-4 mr-2" />
                        Bloquear/Banir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("restaurants")}
            >
              <Building2 className="h-6 w-6" />
              <span>Gerenciar Restaurantes</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-6 w-6" />
              <span>Usuários da Plataforma</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowModerationModal(true)}
            >
              <Shield className="h-6 w-6" />
              <span>Centro de Moderação</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("reports")}
            >
              <DollarSign className="h-6 w-6" />
              <span>Relatórios Financeiros</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Gerenciamento de Restaurantes</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie todos os restaurantes da plataforma ({allRestaurants.length} restaurantes)
              </p>
            </div>
            <Button onClick={() => setShowCreateRestaurant(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Restaurante
            </Button>
          </div>
          <Card>
            <CardContent>
              <div className="space-y-4">
                {allRestaurants.map((restaurant: any) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.owner_email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {restaurant.slug}
                        </Badge>
                        <Badge variant={restaurant.menu_display_mode === 'grid' ? 'default' : 'secondary'} className="text-xs">
                          {restaurant.menu_display_mode === 'grid' ? 'Grade' : 'Lista'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewingRestaurant(restaurant)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Menu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRestaurant(restaurant)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-1" />
                            Moderação
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setBlockBanDialog({ type: 'restaurant', item: restaurant })}>
                            <Shield className="h-4 w-4 mr-2" />
                            Bloquear/Banir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários e suas permissões ({allUsers.length} usuários)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{user.name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.email === 'admin@cardapiodigital.com' ? 'default' : 'secondary'} className="text-xs">
                          {user.email === 'admin@cardapiodigital.com' ? 'Admin' : 'Usuário'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingUserRestaurants(user)}
                      >
                        <Building2 className="h-4 w-4 mr-1" />
                        Ver Restaurantes
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-1" />
                            Moderação
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setBlockBanDialog({ type: 'user', item: user })}>
                            <Shield className="h-4 w-4 mr-2" />
                            Bloquear/Banir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Gerenciamento de Planos</CardTitle>
               <CardDescription>
                 Configure os planos de assinatura disponíveis na plataforma
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
                     <div className="flex items-center gap-2">
                       <Badge variant={plan.subscription_count > 0 ? "default" : "secondary"}>
                         {plan.subscription_count > 0 ? "Ativo" : "Inativo"}
                       </Badge>
                       <Button variant="outline" size="sm">
                         Editar
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>

         <TabsContent value="reports" className="space-y-6">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/reports'}>
               <CardHeader className="text-center">
                 <DollarSign className="h-12 w-12 mx-auto text-green-600 mb-2" />
                 <CardTitle>Relatórios Financeiros</CardTitle>
                 <CardDescription>
                   Análise detalhada de receita, transações e performance financeira
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <Button className="w-full">
                   <BarChart3 className="h-4 w-4 mr-2" />
                   Ver Relatórios
                 </Button>
               </CardContent>
             </Card>

             <Card className="cursor-pointer hover:shadow-md transition-shadow">
               <CardHeader className="text-center">
                 <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                 <CardTitle>Relatórios de Usuários</CardTitle>
                 <CardDescription>
                   Estatísticas de cadastro, atividade e retenção de usuários
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <Button variant="outline" className="w-full" disabled>
                   <Users className="h-4 w-4 mr-2" />
                   Em breve
                 </Button>
               </CardContent>
             </Card>

             <Card className="cursor-pointer hover:shadow-md transition-shadow">
               <CardHeader className="text-center">
                 <Building2 className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                 <CardTitle>Relatórios de Restaurantes</CardTitle>
                 <CardDescription>
                   Performance dos restaurantes, itens mais vendidos e métricas
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <Button variant="outline" className="w-full" disabled>
                   <Building2 className="h-4 w-4 mr-2" />
                   Em breve
                 </Button>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
      </Tabs>

      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(updatedUser) => {
          // Update the user in the list
          setAllUsers(prev =>
            prev.map(u => u.id === updatedUser.id ? updatedUser : u)
          )
          setEditingUser(null)
        }}
      />

      <RestaurantCreateModal
        isOpen={showCreateRestaurant}
        onClose={() => setShowCreateRestaurant(false)}
        onCreate={(newRestaurant) => {
          // Add the new restaurant to the list
          setAllRestaurants(prev => [...prev, newRestaurant])
          setShowCreateRestaurant(false)
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm?.type === 'restaurant') {
            // Remove restaurant from list
            setAllRestaurants(prev => prev.filter(r => r.id !== deleteConfirm.item.id))
          } else if (deleteConfirm?.type === 'user') {
            // Remove user from list
            setAllUsers(prev => prev.filter(u => u.id !== deleteConfirm.item.id))
          }
        }}
        title={`Excluir ${deleteConfirm?.type === 'restaurant' ? 'Restaurante' : 'Usuário'}`}
        description={`Tem certeza que deseja excluir "${deleteConfirm?.item?.name || deleteConfirm?.item?.email}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
      />

      <BlockBanDialog
        isOpen={!!blockBanDialog}
        onClose={() => setBlockBanDialog(null)}
        onConfirm={handleBlockBan}
        entityType={blockBanDialog?.type || 'user'}
        entityName={blockBanDialog?.item?.name || blockBanDialog?.item?.email || ''}
        currentStatus={{
          isBlocked: blockBanDialog?.item?.is_blocked || false,
          isBanned: blockBanDialog?.item?.is_banned || false
        }}
      />

      <RestaurantEditModal
        restaurant={editingRestaurant}
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleEditRestaurant}
      />

      <RestaurantPreviewModal
        restaurant={previewingRestaurant}
        isOpen={!!previewingRestaurant}
        onClose={() => setPreviewingRestaurant(null)}
      />

      <UserRestaurantsModal
        user={viewingUserRestaurants}
        isOpen={!!viewingUserRestaurants}
        onClose={() => setViewingUserRestaurants(null)}
        onEditRestaurant={setEditingRestaurant}
        onPreviewRestaurant={setPreviewingRestaurant}
      />

      <ModerationModal
        isOpen={showModerationModal}
        onClose={() => setShowModerationModal(false)}
      />
    </div>
  )
}