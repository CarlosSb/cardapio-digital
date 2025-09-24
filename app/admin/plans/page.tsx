"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Settings, DollarSign, Users, RefreshCw, Plus } from "lucide-react"

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    description: '',
    price_cents: '',
    currency: 'BRL',
    interval: 'month',
    features: '',
    is_active: true
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration - in real app, fetch from API
      const mockPlans = [
        {
          id: "1",
          name: "Básico",
          slug: "basico",
          description: "Plano ideal para restaurantes iniciantes",
          price_cents: 4970, // R$ 49,70
          currency: "BRL",
          interval: "month",
          features: ["Até 50 itens no cardápio", "QR Code personalizado", "Suporte básico"],
          is_active: true,
          subscription_count: 25
        },
        {
          id: "2",
          name: "Profissional",
          slug: "profissional",
          description: "Para restaurantes em crescimento",
          price_cents: 9970, // R$ 99,70
          currency: "BRL",
          interval: "month",
          features: ["Cardápio ilimitado", "Analytics avançado", "Suporte prioritário", "Integração com delivery"],
          is_active: true,
          subscription_count: 15
        },
        {
          id: "3",
          name: "Empresarial",
          slug: "empresarial",
          description: "Solução completa para grandes redes",
          price_cents: 19970, // R$ 199,70
          currency: "BRL",
          interval: "month",
          features: ["Tudo do Profissional", "Múltiplas unidades", "API completa", "Suporte dedicado", "Consultoria incluída"],
          is_active: false,
          subscription_count: 0
        }
      ]
      setPlans(mockPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPlan = () => {
    setEditingPlan(null)
    setPlanForm({
      name: '',
      slug: '',
      description: '',
      price_cents: '',
      currency: 'BRL',
      interval: 'month',
      features: '',
      is_active: true
    })
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price_cents: plan.price_cents.toString(),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features.join('\n'),
      is_active: plan.is_active
    })
    setShowPlanModal(true)
  }

  const handleSavePlan = () => {
    if (!planForm.name || !planForm.price_cents) {
      alert('Nome e preço são obrigatórios')
      return
    }

    const planData = {
      ...planForm,
      price_cents: parseInt(planForm.price_cents),
      features: planForm.features.split('\n').filter(f => f.trim())
    }

    if (editingPlan) {
      // Update existing plan
      setPlans(prev => prev.map(p =>
        p.id === editingPlan.id ? { ...p, ...planData } : p
      ))
    } else {
      // Add new plan
      const newPlan = {
        ...planData,
        id: Date.now().toString(),
        subscription_count: 0
      }
      setPlans(prev => [...prev, newPlan])
    }

    setShowPlanModal(false)
  }

  const handleTogglePlanStatus = (plan: any) => {
    const action = plan.is_active ? 'desativar' : 'ativar'
    if (confirm(`Tem certeza que deseja ${action} o plano "${plan.name}"?`)) {
      setPlans(prev => prev.map(p =>
        p.id === plan.id ? { ...p, is_active: !p.is_active } : p
      ))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Planos</h1>
          <p className="text-muted-foreground mt-1">
            Configure os planos de assinatura disponíveis na plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPlans} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleNewPlan} className="gap-2">
            <Settings className="h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  R$ {(plan.price_cents / 100).toFixed(2)}
                </span>
                <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{plan.subscription_count} assinaturas ativas</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recursos incluídos:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditPlan(plan)}
                >
                  Editar
                </Button>
                <Button
                  variant={plan.is_active ? "destructive" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleTogglePlanStatus(plan)}
                >
                  {plan.is_active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo dos Planos
          </CardTitle>
          <CardDescription>
            Estatísticas gerais dos planos de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{plans.length}</div>
              <div className="text-sm text-muted-foreground">Total de Planos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</div>
              <div className="text-sm text-muted-foreground">Planos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{plans.reduce((sum, p) => sum + p.subscription_count, 0)}</div>
              <div className="text-sm text-muted-foreground">Total de Assinaturas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                R$ {plans.reduce((sum, p) => sum + (p.price_cents / 100 * p.subscription_count), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Mensal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modifique as informações do plano' : 'Crie um novo plano de assinatura'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Profissional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={planForm.slug}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="ex: profissional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={planForm.description}
                onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do plano"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (centavos)</Label>
                <Input
                  id="price"
                  type="number"
                  value={planForm.price_cents}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, price_cents: e.target.value }))}
                  placeholder="4970"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={planForm.currency} onValueChange={(value) => setPlanForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Período</Label>
                <Select value={planForm.interval} onValueChange={(value) => setPlanForm(prev => ({ ...prev, interval: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Recursos (um por linha)</Label>
              <Textarea
                id="features"
                value={planForm.features}
                onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Até 50 itens no cardápio&#10;QR Code personalizado&#10;Suporte básico"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPlanModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>
              {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}