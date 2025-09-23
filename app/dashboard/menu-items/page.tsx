import { requireAuth } from "@/lib/auth"
import { Category, MenuItemWithCategory, sql } from "@/lib/db"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
          <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Restaurante não encontrado</CardTitle>
            <CardDescription>Você precisa cadastrar um restaurante primeiro</CardDescription>
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
    ` as unknown as Promise<MenuItemWithCategory[]>,
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
        <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Itens</TabsTrigger>
          <TabsTrigger value="add">Adicionar Item</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Seus Itens do Cardápio</CardTitle>
              <CardDescription>Gerencie os pratos do seu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <MenuItemsTable menuItems={menuItems} categories={categories} restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Novo Item do Cardápio</CardTitle>
              <CardDescription>Adicione um novo prato ao seu cardápio</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Você precisa criar pelo menos uma categoria primeiro.</p>
                  <p className="text-sm text-muted-foreground">
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
