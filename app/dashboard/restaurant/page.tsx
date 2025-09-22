import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { RestaurantForm } from "@/components/restaurant-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { delay } from "@/lib/utils"

export default async function RestaurantPage() {
  const user = await requireAuth()

  // Get user's restaurant
  const restaurants = await sql`
    SELECT * FROM restaurants 
    WHERE owner_email = ${user.email}
    ORDER BY created_at DESC
    LIMIT 1
  `

  const restaurant = restaurants[0] || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Restaurante</h1>
        <p className="text-muted-foreground">Configure as informações do seu restaurante</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{restaurant ? "Editar Restaurante" : "Cadastrar Restaurante"}</CardTitle>
          <CardDescription>
            {restaurant
              ? "Atualize as informações do seu restaurante"
              : "Cadastre seu restaurante para começar a criar o cardápio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RestaurantForm restaurant={restaurant} userEmail={user.email} />
        </CardContent>
      </Card>
    </div>
  )
}
