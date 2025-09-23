import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos Simples e Transparentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Básico</CardTitle>
              <div className="text-4xl font-bold text-primary">R$ 29<span className="text-lg">/mês</span></div>
              <CardDescription>Perfeito para restaurantes pequenos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Até 50 itens no cardápio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>QR Code personalizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Suporte por email</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Escolher Plano</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary">Mais Popular</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Profissional</CardTitle>
              <div className="text-4xl font-bold text-primary">R$ 59<span className="text-lg">/mês</span></div>
              <CardDescription>Para restaurantes em crescimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Cardápio ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Analytics e relatórios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Integração com delivery</span>
                </li>
              </ul>
              <Button className="w-full">Escolher Plano</Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Empresarial</CardTitle>
              <div className="text-4xl font-bold text-primary">R$ 99<span className="text-lg">/mês</span></div>
              <CardDescription>Para redes e grandes operações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Múltiplas unidades</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API completa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Gerente de conta dedicado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Consultoria personalizada</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Fale Conosco</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}