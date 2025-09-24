"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Crown, Zap, Building2, CreditCard, TrendingUp, Loader2, Upload, Image, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  slug: string
  description?: string
  price_cents: number
  features: any
}

interface CurrentPlan extends Plan {
  status: string
  current_period_start: string
  current_period_end: string
}

export default function PlansPage() {
  const [plan, setPlan] = useState<CurrentPlan | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [usage, setUsage] = useState({ menu_items_count: 0, views_30d: 0 })
  const [loading, setLoading] = useState(true)
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null)
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPlansData()
  }, [])

  const fetchPlansData = async () => {
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlan(data.currentPlan)
        setPlans(data.availablePlans)
        setUsage(data.usage)
      } else {
        // Fallback to default plans
        setPlans([
          {
            id: 'basic',
            name: 'Básico',
            slug: 'basic',
            description: 'Perfeito para restaurantes pequenos',
            price_cents: 2900,
            features: { menu_items_limit: 50, analytics: false, api_access: false, multiple_units: false }
          },
          {
            id: 'professional',
            name: 'Profissional',
            slug: 'professional',
            description: 'Para restaurantes em crescimento',
            price_cents: 5900,
            features: { menu_items_limit: -1, analytics: true, api_access: false, multiple_units: false }
          },
          {
            id: 'enterprise',
            name: 'Empresarial',
            slug: 'enterprise',
            description: 'Para redes e grandes operações',
            price_cents: 9900,
            features: { menu_items_limit: -1, analytics: true, api_access: true, multiple_units: true }
          }
        ])
      }
    } catch (error) {
      console.warn("Failed to fetch plans data:", error)
      // Use default plans
      setPlans([
        {
          id: 'basic',
          name: 'Básico',
          slug: 'basic',
          description: 'Perfeito para restaurantes pequenos',
          price_cents: 2900,
          features: { menu_items_limit: 50, analytics: false, api_access: false, multiple_units: false }
        },
        {
          id: 'professional',
          name: 'Profissional',
          slug: 'professional',
          description: 'Para restaurantes em crescimento',
          price_cents: 5900,
          features: { menu_items_limit: -1, analytics: true, api_access: false, multiple_units: false }
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          slug: 'enterprise',
          description: 'Para redes e grandes operações',
          price_cents: 9900,
          features: { menu_items_limit: -1, analytics: true, api_access: true, multiple_units: true }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (planSlug: string, planName: string, price: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Tem certeza que deseja assinar o plano ${planName}?\n\n` +
      `Valor: ${price}\n` +
      `Cobrança: Mensal\n\n` +
      `Esta ação irá alterar seu plano atual e processar o pagamento.`
    )

    if (!confirmed) {
      return
    }

    setSelectingPlan(planSlug)
    try {
      const response = await fetch('/api/plans/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh data
        await fetchPlansData()
        alert(result.message)
      } else {
        alert(result.error || 'Erro ao selecionar plano')
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
      alert('Erro ao selecionar plano')
    } finally {
      setSelectingPlan(null)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'basic': return <CheckCircle className="h-6 w-6" />
      case 'professional': return <Zap className="h-6 w-6" />
      case 'enterprise': return <Building2 className="h-6 w-6" />
      default: return <CheckCircle className="h-6 w-6" />
    }
  }

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'basic': return 'text-blue-600'
      case 'professional': return 'text-green-600'
      case 'enterprise': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
      alert('Apenas arquivos SVG são permitidos')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 2MB permitido')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/upload/qr-logo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setCustomLogoUrl(result.logoUrl)
        alert('Logo personalizado enviado com sucesso!')
      } else {
        alert(result.error || 'Erro ao enviar logo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao enviar logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Tem certeza que deseja remover o logo personalizado?')) return

    try {
      const response = await fetch('/api/upload/qr-logo', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setCustomLogoUrl(null)
        alert('Logo personalizado removido com sucesso!')
      } else {
        alert(result.error || 'Erro ao remover logo')
      }
    } catch (error) {
      console.error('Remove error:', error)
      alert('Erro ao remover logo')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Planos e Assinatura</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie seu plano atual e explore opções de upgrade
        </p>
      </div>

      {/* Current Plan Section */}
      {plan && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">Plano Atual: {plan.name}</CardTitle>
                  <CardDescription>
                    Válido até {new Date(plan.current_period_end).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="text-sm">
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Uso do Plano</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Itens do Cardápio</span>
                        <span>{usage.menu_items_count} / {plan.features?.menu_items_limit || '∞'}</span>
                      </div>
                      <Progress
                        value={plan.features?.menu_items_limit ? (usage.menu_items_count / plan.features.menu_items_limit) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Visualizações (30 dias)</span>
                        <span>{usage.views_30d}</span>
                      </div>
                      <Progress value={Math.min((usage.views_30d / 1000) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recursos Incluídos</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Cardápio digital profissional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>QR Code personalizado</span>
                    </li>
                    {plan.features?.analytics && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Analytics e relatórios</span>
                      </li>
                    )}
                    {plan.features?.api_access && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>API completa</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Logo Management - Only for Paid Plans */}
      {plan && plan.slug !== 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logo Personalizado do QR Code
            </CardTitle>
            <CardDescription>
              Faça upload de um logo personalizado para aparecer no centro do seu QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customLogoUrl ? (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img
                    src={customLogoUrl}
                    alt="Logo personalizado"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Logo Personalizado Ativo</h4>
                  <p className="text-sm text-muted-foreground">
                    Seu QR code está usando este logo personalizado
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Faça upload do seu logo</h4>
                    <p className="text-sm text-muted-foreground">
                      Arquivo SVG • Máximo 2MB • Será exibido no centro do QR code
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="gap-2"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadingLogo ? 'Enviando...' : 'Escolher Arquivo'}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Requisitos do logo:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Formato: SVG (vetorial)</li>
                    <li>Tamanho máximo: 2MB</li>
                    <li>Será automaticamente redimensionado para 25% do QR code</li>
                    <li>Mantenha contraste adequado para escaneabilidade</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Planos Disponíveis</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((availablePlan: any) => {
            const isCurrentPlan = plan?.slug === availablePlan.slug
            const features = availablePlan.features || {}

            return (
              <Card key={availablePlan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Plano Atual</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-2 ${getPlanColor(availablePlan.slug)}`}>
                    {getPlanIcon(availablePlan.slug)}
                  </div>
                  <CardTitle className="text-xl">{availablePlan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    R$ {(availablePlan.price_cents / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                  <CardDescription>{availablePlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        {features.menu_items_limit === -1
                          ? 'Cardápio ilimitado'
                          : `Até ${features.menu_items_limit} itens no cardápio`
                        }
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>QR Code personalizado</span>
                    </li>
                    {features.analytics && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Analytics e relatórios</span>
                      </li>
                    )}
                    {features.api_access && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>API completa</span>
                      </li>
                    )}
                    {features.multiple_units && (
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Múltiplas unidades</span>
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || selectingPlan === availablePlan.slug}
                    onClick={() => handleSelectPlan(availablePlan.slug, availablePlan.name, `R$ ${(availablePlan.price_cents / 100).toFixed(2)}`)}
                  >
                    {selectingPlan === availablePlan.slug ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {isCurrentPlan ? 'Plano Atual' : selectingPlan === availablePlan.slug ? 'Processando...' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Uso
          </CardTitle>
          <CardDescription>
            Acompanhe o consumo dos recursos do seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Itens do Cardápio</span>
                <span className="text-sm text-muted-foreground">
                  {usage.menu_items_count} / {plan?.features?.menu_items_limit || '∞'}
                </span>
              </div>
              <Progress
                value={plan?.features?.menu_items_limit ? (usage.menu_items_count / plan.features.menu_items_limit) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Visualizações (30 dias)</span>
                <span className="text-sm text-muted-foreground">{usage.views_30d}</span>
              </div>
              <Progress value={Math.min((usage.views_30d / 1000) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}