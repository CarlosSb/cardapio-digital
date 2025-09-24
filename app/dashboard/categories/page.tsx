import { requireAuth } from "@/lib/auth"
import { Category, sql } from "@/lib/db"
import { CategoriesTable } from "@/components/categories-table"
import { CategoryForm } from "@/components/category-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function CategoriesPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Organize seu cardápio em categorias</p>
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

  // Get categories
  const categories = await sql`
    SELECT * FROM categories 
    WHERE restaurant_id = ${restaurant.id}
    ORDER BY display_order ASC, created_at DESC
  ` as Category[];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Categorias</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Organize seu cardápio em categorias</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="text-xs sm:text-sm">Lista de Categorias</TabsTrigger>
          <TabsTrigger value="add" className="text-xs sm:text-sm">Adicionar Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Suas Categorias</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Gerencie as categorias do seu cardápio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <CategoriesTable categories={categories} restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Nova Categoria</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Adicione uma nova categoria ao seu cardápio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <CategoryForm restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
