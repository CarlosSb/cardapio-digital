import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getRestaurantByOwner } from "@/lib/db"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Smartphone, Users, Zap } from "lucide-react"

import { getOriginUrl } from "@/lib/utils"
import { headers } from "next/headers"

export default async function QRCodePage() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const restaurant = await getRestaurantByOwner(user.email)
  if (!restaurant) {
    redirect("/dashboard/restaurant")
  }

  const headersList: any = headers()
  const originUrl = getOriginUrl(headersList)
  const menuUrl = `${originUrl}/menu/${restaurant.slug || ""}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code do Cardápio</h1>
        <p className="text-gray-600 mt-2">Gere e baixe o QR code para que seus clientes acessem o cardápio digital</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
            <QRCodeGenerator restaurantSlug={restaurant.slug} restaurantName={restaurant.name}  menuUrl={menuUrl} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Como usar o QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Baixe o QR Code</h4>
                  <p className="text-sm text-gray-600">Clique em "Baixar PNG" para salvar a imagem</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Imprima e coloque nas mesas</h4>
                  <p className="text-sm text-gray-600">Posicione o QR code onde os clientes possam vê-lo facilmente</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Clientes escaneiam e acessam</h4>
                  <p className="text-sm text-gray-600">Eles verão seu cardápio atualizado instantaneamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Benefícios do Cardápio Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Acesso instantâneo pelo celular</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Atualizações em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Sem necessidade de cardápios físicos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Melhor experiência do cliente</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
