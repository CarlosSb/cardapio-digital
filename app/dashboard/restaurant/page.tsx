import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { RestaurantForm } from "@/components/restaurant-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RestaurantPage() {
  const user = await requireAuth()

  // Get user's restaurant
  const restaurants = await sql`
    SELECT * FROM restaurants 
    WHERE owner_email = ${user.email}
    ORDER BY created_at DESC
    LIMIT 1
  `

  const restaurant = restaurants[0] as any || null

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Restaurante</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configure as informações do seu restaurante
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            {restaurant ? "Editar Restaurante" : "Cadastrar Restaurante"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {restaurant
              ? "Atualize as informações do seu restaurante"
              : "Cadastre seu restaurante para começar a criar o cardápio"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RestaurantForm restaurant={restaurant} userEmail={user.email} />
        </CardContent>
      </Card>
    </div>
  )
}
