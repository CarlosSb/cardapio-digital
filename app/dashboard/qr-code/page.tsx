import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getRestaurantByOwner } from "@/lib/db"
import { getCurrentPlan } from "@/lib/plan-limits"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Smartphone, Users, Zap, Upload, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function QRCodePage() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const restaurant = await getRestaurantByOwner(user.email)
  if (!restaurant) {
    redirect("/dashboard/restaurant")
  }

  // Get current plan information
  const plan = await getCurrentPlan(restaurant.id)
  const isPaidPlan = plan && plan.slug !== 'basic' && plan.slug !== 'free'
  const customLogoUrl = (restaurant as any).custom_qr_logo_url

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">QR Code do Cardápio</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gere e baixe o QR code personalizado para que seus clientes acessem o cardápio digital
        </p>
      </div>

      {/* QR Code Generator */}
      <QRCodeGenerator
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        customLogoUrl={customLogoUrl}
        isPaidPlan={isPaidPlan}
      />

      {/* Logo da Plataforma */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                src={isPaidPlan && customLogoUrl ? customLogoUrl : "/digital-menu-logo.svg"}
                alt={isPaidPlan && customLogoUrl ? "Logo Personalizado" : "Logo Cardápio Digital"}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base mb-1">
                {isPaidPlan && customLogoUrl ? 'Logo Personalizado' : 'Logo da Plataforma'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isPaidPlan && customLogoUrl
                  ? 'Seu QR code usa seu logo personalizado para máxima identidade visual'
                  : isPaidPlan
                    ? 'Upgrade para plano pago para usar seu próprio logo no QR code'
                    : 'Seu QR code inclui o logo da Cardápio Digital. Upgrade para usar seu logo personalizado'
                }
              </p>
              {isPaidPlan && !customLogoUrl && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Fazer Upload do Logo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Cards Informativos - Responsivo */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm">Baixe o QR Code</h4>
                <p className="text-xs text-muted-foreground">Clique em "Baixar PNG" para imagem de alta qualidade</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm">Imprima e Exponha</h4>
                <p className="text-xs text-muted-foreground">Tamanho mínimo 3x3 cm em local visível</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm">Clientes Acessam</h4>
                <p className="text-xs text-muted-foreground">Cardápio atualizado instantaneamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Acesso instantâneo pelo celular</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Atualizações em tempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Sem cardápios físicos</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Experiência premium</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-blue-900">Dicas Técnicas</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Tamanho mínimo: 3x3 cm</li>
                  <li>• Papel de boa qualidade</li>
                  <li>• Evite dobras e danos</li>
                  <li>• Teste com diferentes aparelhos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
