"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Eye, Edit, Calendar, Users, RefreshCw } from "lucide-react"
import { RestaurantPreviewModal } from "@/components/restaurant-preview-modal"
import { RestaurantEditModal } from "@/components/restaurant-edit-modal"

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewingRestaurant, setPreviewingRestaurant] = useState<any>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/restaurants')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRestaurant = async (updates: Partial<any>) => {
    if (!editingRestaurant) return

    try {
      const response = await fetch('/api/admin/restaurants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: editingRestaurant.id,
          updates
        })
      })

      if (response.ok) {
        setRestaurants(prev => prev.map(r =>
          r.id === editingRestaurant.id ? { ...r, ...updates } : r
        ))
        setEditingRestaurant(null)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating restaurant:', error)
      alert('Erro ao atualizar restaurante')
    }
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Restaurantes</h1>
            <p className="text-muted-foreground">Carregando restaurantes...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Restaurantes</h1>
          <p className="text-muted-foreground mt-1">
            Lista completa de todos os restaurantes da plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {restaurants.length} restaurantes
          </Badge>
          <Button onClick={loadRestaurants} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {restaurants.map((restaurant: any) => (
          <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Restaurant Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {restaurant.logo_url ? (
                        <img
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span>{restaurant.owner_email}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </CardDescription>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewingRestaurant(restaurant)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Menu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRestaurant(restaurant)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Slug</p>
                  <Badge variant="outline" className="break-all">{restaurant.slug}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={restaurant.is_blocked ? 'destructive' : restaurant.is_banned ? 'destructive' : 'default'}>
                    {restaurant.is_banned ? 'Banido' : restaurant.is_blocked ? 'Bloqueado' : 'Ativo'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Visualizações</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">0</span>
                  </div>
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
                  <p className="text-sm text-muted-foreground line-clamp-2">
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

      <RestaurantPreviewModal
        restaurant={previewingRestaurant}
        isOpen={!!previewingRestaurant}
        onClose={() => setPreviewingRestaurant(null)}
      />

      <RestaurantEditModal
        restaurant={editingRestaurant}
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleEditRestaurant}
      />
    </div>
  )
}