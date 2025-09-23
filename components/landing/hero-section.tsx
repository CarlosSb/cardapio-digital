import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto text-center">
        <Badge variant="secondary" className="mb-4">
          🚀 Transforme seu restaurante
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Cardápio Digital
          <span className="text-primary block">Moderno e Inteligente</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Crie um cardápio digital profissional em minutos. Seus clientes acessam via QR code,
          atualizam automaticamente e você vende mais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Ver Demonstração
          </Button>
        </div>
      </div>
    </section>
  )
}