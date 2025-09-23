"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit, ExternalLink, Building2, Calendar, AlertTriangle } from "lucide-react"
import type { Restaurant } from "@/lib/db"

interface UserRestaurantsModalProps {
  user: {
    id: string
    name: string | null
    email: string
  } | null
  isOpen: boolean
  onClose: () => void
  onEditRestaurant?: (restaurant: Restaurant) => void
  onPreviewRestaurant?: (restaurant: Restaurant) => void
}

export function UserRestaurantsModal({
  user,
  isOpen,
  onClose,
  onEditRestaurant,
  onPreviewRestaurant
}: UserRestaurantsModalProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadUserRestaurants()
    }
  }, [user, isOpen])

  const loadUserRestaurants = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/restaurants?owner_email=${encodeURIComponent(user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants || [])
      } else {
        console.error('Failed to load user restaurants')
        setRestaurants([])
      }
    } catch (error) {
      console.error('Error loading user restaurants:', error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (restaurant: Restaurant) => {
    if ((restaurant as any).is_banned) {
      return <Badge variant="destructive">Banido</Badge>
    }
    if ((restaurant as any).is_blocked) {
      return <Badge variant="secondary">Bloqueado</Badge>
    }
    return <Badge variant="default">Ativo</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Restaurantes de {user?.name || user?.email}
          </DialogTitle>
          <DialogDescription>
            Lista completa de restaurantes associados a este usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Carregando restaurantes...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum restaurante encontrado para este usuário.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{restaurant.name}</h3>
                          {restaurant.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {restaurant.description}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(restaurant)}
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Slug:</span>
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {restaurant.slug}
                          </code>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Criado em {formatDate(restaurant.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Modo:</span>
                          <Badge variant="outline" className="text-xs">
                            {restaurant.menu_display_mode === 'grid' ? 'Grade' : 'Lista'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPreviewRestaurant?.(restaurant)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Menu
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditRestaurant?.(restaurant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/menu/${restaurant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>

                      {/* Warning for blocked/banned */}
                      {((restaurant as any).is_blocked || (restaurant as any).is_banned) && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-800">
                            {(restaurant as any).is_banned ? 'Restaurante banido' : 'Restaurante bloqueado'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}