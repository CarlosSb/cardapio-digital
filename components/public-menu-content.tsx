"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChefHat, ImageIcon } from "lucide-react"
import type { Restaurant, Category, MenuItem } from "@/lib/db"

interface MenuItemWithCategory extends MenuItem {
  category_name: string
  category_display_order: number
}

interface CategoryWithItems extends Category {
  items: MenuItemWithCategory[]
}

interface PublicMenuContentProps {
  restaurant: Restaurant
  menuByCategory: CategoryWithItems[]
}

export function PublicMenuContent({ restaurant, menuByCategory }: PublicMenuContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const filteredCategories = selectedCategory
    ? menuByCategory.filter((category) => category.id === selectedCategory)
    : menuByCategory

  const availableCategories = menuByCategory.filter((category) => category.items.length > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Filter Moderno */}
      {availableCategories.length > 1 && (
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-lg transform scale-105"
                  : "bg-card hover:bg-accent hover:text-accent-foreground border border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <span>Todos os itens</span>
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
                {menuByCategory.reduce((acc, cat) => acc + cat.items.length, 0)}
              </span>
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg transform scale-105"
                    : "bg-card hover:bg-accent hover:text-accent-foreground border border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <span>{category.name}</span>
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
                  {category.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Categories */}
      <div className="space-y-12">
        {filteredCategories.map((category) => {
          if (category.items.length === 0) return null

          return (
            <section key={category.id} className="space-y-8">
              {/* Category Header Moderno */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground text-base max-w-2xl mx-auto mt-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
                </div>

                {/* Contador de itens */}
                <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    {category.items.length} {category.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              {/* Menu Items Grid Moderno */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group card-modern overflow-hidden animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Item Image Moderno */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {item.image_url ? (
                        <>
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              target.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                              <ChefHat className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">Sem imagem</p>
                          </div>
                        </div>
                      )}

                      {/* Badge de preço flutuante */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                          <span className="text-primary font-bold text-sm">
                            {formatPrice(Number(item.price))}
                          </span>
                        </div>
                      </div>

                      {/* Overlay de indisponibilidade */}
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2">
                            <span className="text-destructive font-semibold text-sm">Indisponível</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      {/* Item Header */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors duration-200">
                          {item.name}
                        </h3>

                        {/* Item Description */}
                        {item.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Badge de categoria */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {category.name}
                        </span>

                        {item.is_available && (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium">Disponível</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.every((category) => category.items.length === 0) && (
        <div className="text-center py-16 space-y-4">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Cardápio em preparação</h3>
            <p className="text-muted-foreground">
              {selectedCategory ? "Nenhum item disponível nesta categoria." : "Nosso cardápio está sendo preparado."}
            </p>
          </div>
          {selectedCategory && (
            <Button variant="outline" onClick={() => setSelectedCategory(null)} className="mt-4">
              Ver todas as categorias
            </Button>
          )}
        </div>
      )}

      {/* Footer Moderno */}
      <footer className="mt-20 pt-12 border-t border-border/50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-medium text-foreground">
              Cardápio Digital - {restaurant.name}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Atualizado em {new Date().toLocaleDateString("pt-BR", {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>

          {/* Call to action sutil */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground/80">
              🍽️ Bom apetite! | 📱 Peça pelo WhatsApp
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
