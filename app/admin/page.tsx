"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, DollarSign, TrendingUp, Shield, BarChart3, Settings, RefreshCw, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { AdminPageSkeleton } from "@/components/skeletons"

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        } else {
          // Fallback data
          setMetrics({
            userMetrics: { total_users: 0, blocked_users: 0, banned_users: 0 },
            restaurantMetrics: { total_restaurants: 0, blocked_restaurants: 0, banned_restaurants: 0 },
            paymentMetrics: { total_revenue: 0, total_payments: 0 }
          })
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
        setMetrics({
          userMetrics: { total_users: 0, blocked_users: 0, banned_users: 0 },
          restaurantMetrics: { total_restaurants: 0, blocked_restaurants: 0, banned_restaurants: 0 },
          paymentMetrics: { total_revenue: 0, total_payments: 0 }
        })
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  if (loading) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da plataforma Cardápio Digital
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userMetrics?.total_users || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-red-500 mr-1">
                {metrics.userMetrics?.blocked_users || 0} bloqueados
              </span>
              <span className="mx-1">•</span>
              <span className="text-destructive">
                {metrics.userMetrics?.banned_users || 0} banidos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Restaurants Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.restaurantMetrics?.total_restaurants || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-yellow-600 mr-1">
                {metrics.restaurantMetrics?.blocked_restaurants || 0} bloqueados
              </span>
              <span className="mx-1">•</span>
              <span className="text-green-600">
                {((metrics.restaurantMetrics?.total_restaurants || 0) - (metrics.restaurantMetrics?.blocked_restaurants || 0) - (metrics.restaurantMetrics?.banned_restaurants || 0))} ativos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {((metrics.paymentMetrics?.total_revenue || 0) / 100).toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">
                {metrics.paymentMetrics?.total_payments || 0} transações
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Growth Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{((metrics.userMetrics?.new_users_30d || 0) / Math.max(metrics.userMetrics?.total_users || 1, 1) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Novos usuários (30 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/restaurants" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gerenciar Restaurantes</h3>
                  <p className="text-sm text-muted-foreground">
                    Aprovar, bloquear ou editar restaurantes
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/users" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gerenciar Usuários</h3>
                  <p className="text-sm text-muted-foreground">
                    Administrar contas e permissões
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/reports" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Relatórios Financeiros</h3>
                  <p className="text-sm text-muted-foreground">
                    Análise detalhada de receita e performance
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/moderation" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Centro de Moderação</h3>
                  <p className="text-sm text-muted-foreground">
                    Revisar e moderar conteúdo
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/admin/plans" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Configurar Planos</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar assinaturas e preços
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/dashboard" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dashboard Restaurante</h3>
                  <p className="text-sm text-muted-foreground">
                    Acessar painel de restaurante
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}