import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-muted-foreground">
            Histórias de sucesso de restaurantes que transformaram seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Desde que implementamos o cardápio digital, nossas vendas aumentaram 30%.
                Os clientes adoram a praticidade e nós economizamos uma fortuna com reimpressões."
              </p>
              <div className="font-semibold">Maria Silva</div>
              <div className="text-sm text-muted-foreground">Dona do Restaurante Sabor Caseiro</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "A interface é incrível e nossos clientes ficam impressionados com o design profissional.
                O QR code facilitou muito a vida dos garçons."
              </p>
              <div className="font-semibold">João Santos</div>
              <div className="text-sm text-muted-foreground">Proprietário do Bar do João</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "O suporte é excepcional e as atualizações são feitas em tempo real.
                Recomendo para todos os restaurantes que querem se modernizar."
              </p>
              <div className="font-semibold">Ana Costa</div>
              <div className="text-sm text-muted-foreground">Gerente do Restaurante Elegante</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}