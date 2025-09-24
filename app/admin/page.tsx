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
      {/* Header Section - Mobile First */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral da plataforma Cardápio Digital
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid - Mobile First */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{metrics.userMetrics?.total_users || 0}</div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mt-2">
              <span className="text-red-500 whitespace-nowrap">
                {metrics.userMetrics?.blocked_users || 0} bloqueados
              </span>
              <span className="hidden sm:inline mx-1">•</span>
              <span className="text-destructive whitespace-nowrap">
                {metrics.userMetrics?.banned_users || 0} banidos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Restaurants Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Restaurantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{metrics.restaurantMetrics?.total_restaurants || 0}</div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mt-2">
              <span className="text-yellow-600 whitespace-nowrap">
                {metrics.restaurantMetrics?.blocked_restaurants || 0} bloqueados
              </span>
              <span className="hidden sm:inline mx-1">•</span>
              <span className="text-green-600 whitespace-nowrap">
                {((metrics.restaurantMetrics?.total_restaurants || 0) - (metrics.restaurantMetrics?.blocked_restaurants || 0) - (metrics.restaurantMetrics?.banned_restaurants || 0))} ativos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold truncate">
              R$ {((metrics.paymentMetrics?.total_revenue || 0) / 100).toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
              <span className="text-green-600 truncate">
                {metrics.paymentMetrics?.total_payments || 0} transações
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Growth Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              +{((metrics.userMetrics?.new_users_30d || 0) / Math.max(metrics.userMetrics?.total_users || 1, 1) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              Novos usuários (30 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Mobile First */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/admin/restaurants" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Gerenciar Restaurantes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Aprovar, bloquear ou editar restaurantes
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-green-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/admin/users" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Gerenciar Usuários</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Administrar contas e permissões
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/admin/reports" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors flex-shrink-0">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Relatórios Financeiros</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Análise detalhada de receita e performance
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-red-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/admin/moderation" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Centro de Moderação</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Revisar e moderar conteúdo
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-orange-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/admin/plans" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors flex-shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Configurar Planos</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Gerenciar assinaturas e preços
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <Link href="/dashboard" className="block">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors flex-shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg truncate">Dashboard Restaurante</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
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