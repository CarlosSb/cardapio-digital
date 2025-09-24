import { requireAuth } from "@/lib/auth"
import { Category, MenuItem, sql } from "@/lib/db"
import { getCurrentPlan, getMaxImagesLimit } from "@/lib/plan-limits"
import { MenuItemsTable } from "@/components/menu-items-table"
import { MenuItemForm } from "@/components/menu-item-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { delay } from "@/lib/utils"

export default async function MenuItemsPage() {
  const user = await requireAuth()

  // Get user's restaurant
  const restaurants = await sql`
    SELECT * FROM restaurants 
    WHERE owner_email = ${user.email}
    ORDER BY created_at DESC
    LIMIT 1
  `

  const restaurant = restaurants[0]

  if (!restaurant) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cardápio</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os itens do seu cardápio</p>
        </div>
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Restaurante não encontrado</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Você precisa cadastrar um restaurante primeiro
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get current plan
  const plan = await getCurrentPlan(restaurant.id)
  const planSlug = plan.slug
  const maxImages = getMaxImagesLimit(planSlug)

  // Get categories and menu items
  const [categories, menuItems] = await Promise.all([
    sql`
      SELECT * FROM categories 
      WHERE restaurant_id = ${restaurant.id}
      ORDER BY display_order ASC
    ` as unknown as Promise<Category[]>,
    sql`
      SELECT m.*, c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ${restaurant.id}
      ORDER BY c.display_order ASC, m.display_order ASC, m.created_at DESC
    ` as unknown as Promise<MenuItem[]>,
  ])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cardápio</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gerencie os itens do seu cardápio</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="text-xs sm:text-sm">Lista de Itens</TabsTrigger>
          <TabsTrigger value="add" className="text-xs sm:text-sm">Adicionar Item</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Seus Itens do Cardápio</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Gerencie os pratos do seu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MenuItemsTable menuItems={menuItems} categories={categories} restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Novo Item do Cardápio</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Adicione um novo prato ao seu cardápio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {categories.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Você precisa criar pelo menos uma categoria primeiro.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Vá para a seção "Categorias" para criar suas primeiras categorias.
                  </p>
                </div>
              ) : (
                <MenuItemForm restaurantId={restaurant.id} categories={categories} maxImages={maxImages} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
