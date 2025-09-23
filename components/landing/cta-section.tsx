import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para transformar seu restaurante?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Junte-se a centenas de restaurantes que já modernizaram seu negócio com nosso cardápio digital
        </p>
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 py-6">
            Começar Meu Cardápio Digital
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground mt-4">
          14 dias grátis • Sem cartão de crédito • Cancele a qualquer momento
        </p>
      </div>
    </section>
  )
}