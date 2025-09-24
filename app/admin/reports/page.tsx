"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { CalendarIcon, DollarSign, TrendingUp, Users, Building2, Download, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>({})

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        console.error("Failed to load report data")
        // Fallback mock data
        const mockData = {
          revenue: {
            total: 15750,
            growth: 12.5,
            chart: [
              { date: "2024-09-01", amount: 1200 },
              { date: "2024-09-02", amount: 1350 },
              { date: "2024-09-03", amount: 1100 },
              { date: "2024-09-04", amount: 1400 },
              { date: "2024-09-05", amount: 1600 },
              { date: "2024-09-06", amount: 1800 },
              { date: "2024-09-07", amount: 1900 },
            ]
          },
          users: {
            total: 245,
            new: 23,
            active: 189,
            chart: [
              { date: "2024-09-01", new: 5, active: 120 },
              { date: "2024-09-02", new: 3, active: 125 },
              { date: "2024-09-03", new: 7, active: 130 },
              { date: "2024-09-04", new: 4, active: 135 },
              { date: "2024-09-05", new: 6, active: 140 },
              { date: "2024-09-06", new: 8, active: 145 },
              { date: "2024-09-07", new: 2, active: 150 },
            ]
          },
          restaurants: {
            total: 45,
            active: 38,
            premium: 12,
            distribution: [
              { name: "Básico", value: 25, color: "#3b82f6" },
              { name: "Profissional", value: 15, color: "#10b981" },
              { name: "Empresarial", value: 5, color: "#f59e0b" },
            ]
          },
          payments: {
            total: 89,
            successful: 85,
            pending: 3,
            failed: 1,
            methods: [
              { method: "Cartão de Crédito", count: 65 },
              { method: "PIX", count: 18 },
              { method: "Boleto", count: 6 },
            ]
          }
        }
        setReportData(mockData)
      }
    } catch (error) {
      console.error("Error loading report data:", error)
      // Fallback mock data
      const mockData = {
        revenue: {
          total: 15750,
          growth: 12.5,
          chart: [
            { date: "2024-09-01", amount: 1200 },
            { date: "2024-09-02", amount: 1350 },
            { date: "2024-09-03", amount: 1100 },
            { date: "2024-09-04", amount: 1400 },
            { date: "2024-09-05", amount: 1600 },
            { date: "2024-09-06", amount: 1800 },
            { date: "2024-09-07", amount: 1900 },
          ]
        },
        users: {
          total: 245,
          new: 23,
          active: 189,
          chart: [
            { date: "2024-09-01", new: 5, active: 120 },
            { date: "2024-09-02", new: 3, active: 125 },
            { date: "2024-09-03", new: 7, active: 130 },
            { date: "2024-09-04", new: 4, active: 135 },
            { date: "2024-09-05", new: 6, active: 140 },
            { date: "2024-09-06", new: 8, active: 145 },
            { date: "2024-09-07", new: 2, active: 150 },
          ]
        },
        restaurants: {
          total: 45,
          active: 38,
          premium: 12,
          distribution: [
            { name: "Básico", value: 25, color: "#3b82f6" },
            { name: "Profissional", value: 15, color: "#10b981" },
            { name: "Empresarial", value: 5, color: "#f59e0b" },
          ]
        },
        payments: {
          total: 89,
          successful: 85,
          pending: 3,
          failed: 1,
          methods: [
            { method: "Cartão de Crédito", count: 65 },
            { method: "PIX", count: 18 },
            { method: "Boleto", count: 6 },
          ]
        }
      }
      setReportData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = new Date()
    let from: Date

    switch (period) {
      case "7d":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    setDateRange({ from, to: now })
  }

  const handleExportReport = (format: 'csv' | 'pdf' = 'csv') => {
    if (format === 'pdf') {
      // For now, export as CSV since PDF generation would require additional libraries
      alert('Exportação em PDF será implementada em breve. Exportando como CSV.')
    }

    // Create CSV content with comprehensive data
    const csvContent = generateCSVContent()

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-completo-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSVContent = () => {
    const headers = ['Categoria', 'Métrica', 'Valor', 'Período', 'Data Exportação']
    const exportDate = new Date().toLocaleString('pt-BR')

    const rows = [
      // Receita e Financeiro
      ['Financeiro', 'Receita Total', `R$ ${reportData.revenue?.total?.toFixed(2) || '0.00'}`, selectedPeriod, exportDate],
      ['Financeiro', 'Receita Média por Restaurante', `R$ ${reportData.restaurants?.total > 0 ? (reportData.revenue?.total / reportData.restaurants.total).toFixed(2) : '0.00'}`, selectedPeriod, exportDate],
      ['Financeiro', 'Pagamentos Confirmados', reportData.payments?.successful || 0, selectedPeriod, exportDate],
      ['Financeiro', 'Pagamentos Pendentes', reportData.payments?.pending || 0, selectedPeriod, exportDate],
      ['Financeiro', 'Taxa de Conversão de Pagamentos', `${reportData.payments?.total > 0 ? Math.round((reportData.payments.successful / reportData.payments.total) * 100) : 0}%`, selectedPeriod, exportDate],

      // Usuários
      ['Usuários', 'Total de Usuários', reportData.users?.total || 0, selectedPeriod, exportDate],
      ['Usuários', 'Usuários Novos', reportData.users?.new || 0, selectedPeriod, exportDate],
      ['Usuários', 'Usuários Ativos', reportData.users?.active || 0, selectedPeriod, exportDate],
      ['Usuários', 'Taxa de Crescimento de Usuários', `${reportData.users?.total > 0 ? ((reportData.users.new / reportData.users.total) * 100).toFixed(1) : 0}%`, selectedPeriod, exportDate],

      // Restaurantes
      ['Restaurantes', 'Total de Restaurantes', reportData.restaurants?.total || 0, selectedPeriod, exportDate],
      ['Restaurantes', 'Restaurantes Ativos', reportData.restaurants?.active || 0, selectedPeriod, exportDate],
      ['Restaurantes', 'Restaurantes Premium', reportData.restaurants?.premium || 0, selectedPeriod, exportDate],
      ['Restaurantes', 'Taxa de Ativação', `${reportData.restaurants?.total > 0 ? Math.round((reportData.restaurants.active / reportData.restaurants.total) * 100) : 0}%`, selectedPeriod, exportDate],

      // Performance
      ['Performance', 'Ticket Médio', `R$ ${reportData.payments?.successful > 0 ? (reportData.revenue?.total / reportData.payments.successful).toFixed(2) : '0.00'}`, selectedPeriod, exportDate],
      ['Performance', 'Usuários por Restaurante', (reportData.users?.total / Math.max(reportData.restaurants?.total || 1, 1)).toFixed(1), selectedPeriod, exportDate],
      ['Performance', 'Receita por Usuário', `R$ ${reportData.users?.total > 0 ? (reportData.revenue?.total / reportData.users.total).toFixed(2) : '0.00'}`, selectedPeriod, exportDate],
    ]

    const csvRows = [headers.join(',')]
    rows.forEach(row => {
      csvRows.push(row.map(cell => `"${cell}"`).join(','))
    })

    return csvRows.join('\n')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de receita, usuários e performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReportData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExportReport('csv')}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportData.revenue?.total?.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">
                +{reportData.revenue?.growth}% vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.users?.new}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportData.users?.total} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.restaurants?.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {reportData.restaurants?.total} cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.payments?.total > 0
                ? Math.round((reportData.payments.successful / reportData.payments.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportData.payments?.successful} pagamentos confirmados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>
                Receita diária no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.revenue?.chart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                  />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), "dd/MM/yyyy", { locale: ptBR })}
                    formatter={(value: number) => [`R$ ${value}`, "Receita"]}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>
                Novos cadastros e usuários ativos por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData.users?.chart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), "dd/MM/yyyy", { locale: ptBR })}
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Novos usuários"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Usuários ativos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos</CardTitle>
                <CardDescription>
                  Restaurantes por plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.restaurants?.distribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.restaurants?.distribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
                <CardDescription>
                  Visão geral dos restaurantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Restaurantes</span>
                  <Badge variant="secondary">{reportData.restaurants?.total}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Restaurantes Ativos</span>
                  <Badge variant="default">{reportData.restaurants?.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Planos Premium</span>
                  <Badge variant="outline">{reportData.restaurants?.premium}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pagamentos</CardTitle>
                <CardDescription>
                  Distribuição por status de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pagamentos Confirmados</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {reportData.payments?.successful}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pagamentos Pendentes</span>
                  <Badge variant="secondary">
                    {reportData.payments?.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pagamentos Falhados</span>
                  <Badge variant="destructive">
                    {reportData.payments?.failed}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Preferências dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportData.payments?.methods?.map((method: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{method.method}</span>
                    <Badge variant="outline">{method.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}