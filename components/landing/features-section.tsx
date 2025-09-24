import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Zap, Users, ChefHat, Star, CheckCircle } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que seu restaurante precisa
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recursos poderosos para modernizar seu negócio e encantar seus clientes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Acesso Mobile</CardTitle>
              <CardDescription>
                Seus clientes acessam o cardápio pelo celular, sem necessidade de cardápios físicos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Atualização Instantânea</CardTitle>
              <CardDescription>
                Mude preços, disponibilidade e itens em tempo real. Sem reimpressões custosas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>QR Code Personalizado</CardTitle>
              <CardDescription>
                Gere QR codes com sua marca para colocar nas mesas e aumentar o engajamento
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Interface Intuitiva</CardTitle>
              <CardDescription>
                Dashboard fácil de usar para gerenciar seu cardápio, categorias e configurações
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Star className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Design Profissional</CardTitle>
              <CardDescription>
                Templates modernos e responsivos que impressionam seus clientes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Suporte Completo</CardTitle>
              <CardDescription>
                Equipe dedicada para ajudar você a configurar e otimizar seu cardápio digital
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}