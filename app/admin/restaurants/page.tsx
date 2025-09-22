import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sql } from "@/lib/db"
import { Building2, Eye, Edit, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default async function AdminRestaurantsPage() {
  // Get all restaurants with their stats
  const restaurants = await sql`
    SELECT
      r.*,
      COALESCE(mv.view_count, 0) as view_count,
      COALESCE(mv.last_viewed, r.created_at) as last_viewed
    FROM restaurants r
    LEFT JOIN (
      SELECT
        restaurant_id,
        COUNT(*) as view_count,
        MAX(viewed_at) as last_viewed
      FROM menu_views
      GROUP BY restaurant_id
    ) mv ON r.id = mv.restaurant_id
    ORDER BY r.created_at DESC
  `

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Restaurantes</h1>
          <p className="text-muted-foreground">
            Lista completa de todos os restaurantes da plataforma
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {restaurants.length} restaurantes
        </Badge>
      </div>

      <div className="grid gap-6">
        {restaurants.map((restaurant: any) => (
          <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {restaurant.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span>{restaurant.owner_email}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Menu
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Slug</p>
                  <Badge variant="outline">{restaurant.slug}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Visualizações</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{restaurant.view_count}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Última Visualização</p>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.last_viewed
                      ? new Date(restaurant.last_viewed).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Modo de Exibição</p>
                  <Badge variant={restaurant.menu_display_mode === 'grid' ? 'default' : 'secondary'}>
                    {restaurant.menu_display_mode === 'grid' ? 'Grade' : 'Lista'}
                  </Badge>
                </div>
              </div>

              {restaurant.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {restaurant.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {restaurants.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum restaurante cadastrado</h3>
              <p className="text-muted-foreground text-center">
                Ainda não há restaurantes cadastrados na plataforma.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}