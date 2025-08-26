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
      {/* Category Filter */}
      {availableCategories.length > 1 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              Todos
            </Button>
            {availableCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Categories */}
      <div className="space-y-12">
        {filteredCategories.map((category) => {
          if (category.items.length === 0) return null

          return (
            <section key={category.id} className="space-y-6">
              {/* Category Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
                )}
              </div>

              {/* Menu Items Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Item Image */}
                    <div className="aspect-video bg-card relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div
                        className={`${
                          item.image_url ? "hidden" : "flex"
                        } absolute inset-0 items-center justify-center bg-card`}
                      >
                        <div className="text-center space-y-2">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                          <ChefHat className="h-6 w-6 text-muted-foreground mx-auto" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Item Header */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-card-foreground leading-tight">{item.name}</h3>
                        <Badge variant="secondary" className="shrink-0 font-bold">
                          {formatPrice(Number(item.price))}
                        </Badge>
                      </div>

                      {/* Item Description */}
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
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

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Cardápio Digital - {restaurant.name}</p>
          <p className="text-xs text-muted-foreground">Atualizado em {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </footer>
    </div>
  )
}
