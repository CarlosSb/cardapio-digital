import { ChefHat } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="font-bold">Cardápio Digital</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modernizando restaurantes com tecnologia inovadora
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Recursos</a></li>
              <li><a href="#" className="hover:text-foreground">Preços</a></li>
              <li><a href="#" className="hover:text-foreground">Demonstração</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-foreground">Contato</a></li>
              <li><a href="#" className="hover:text-foreground">Status</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Sobre</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Carreiras</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Cardápio Digital. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}