import { requireAuth } from "@/lib/auth"
import { Category, sql } from "@/lib/db"
import { CategoriesTable } from "@/components/categories-table"
import { CategoryForm } from "@/components/category-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { delay } from "@/lib/utils"

export default async function CategoriesPage() {
  const user = await requireAuth()


  await delay(3000);

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
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize seu cardápio em categorias</p>
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

  // Get categories
  const categories = await sql`
    SELECT * FROM categories 
    WHERE restaurant_id = ${restaurant.id}
    ORDER BY display_order ASC, created_at DESC
  ` as Category[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
        <p className="text-muted-foreground">Organize seu cardápio em categorias</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Categorias</TabsTrigger>
          <TabsTrigger value="add">Adicionar Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Suas Categorias</CardTitle>
              <CardDescription>Gerencie as categorias do seu cardápio</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesTable categories={categories} restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Nova Categoria</CardTitle>
              <CardDescription>Adicione uma nova categoria ao seu cardápio</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
