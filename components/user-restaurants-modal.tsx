"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit, ExternalLink, Building2, Calendar, AlertTriangle, Settings } from "lucide-react"
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

    console.log('🔍 Loading restaurants for user:', user.email)
    setLoading(true)
    try {
      const response = await fetch(`/api/restaurants?owner_email=${encodeURIComponent(user.email)}`)
      console.log('📡 API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response data:', data)
        setRestaurants(data.restaurants || [])
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to load user restaurants:', response.status, errorText)
        setRestaurants([])
      }
    } catch (error) {
      console.error('💥 Error loading user restaurants:', error)
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
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
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
              <p className="text-muted-foreground mb-2">Nenhum restaurante encontrado para este usuário.</p>
              <p className="text-xs text-muted-foreground">
                Email do usuário: <code className="bg-muted px-1 py-0.5 rounded">{user?.email}</code>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Verifique se o usuário possui restaurantes cadastrados.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                      {/* Restaurant Image */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {restaurant.logo_url ? (
                            <img
                              src={restaurant.logo_url}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Restaurant Info - Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Name with truncation */}
                            <h3 className="font-semibold text-base truncate" title={restaurant.name}>
                              {restaurant.name}
                            </h3>

                            {/* Slug with truncation */}
                            <p className="text-sm text-muted-foreground truncate mt-1" title={restaurant.slug}>
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                                {restaurant.slug}
                              </code>
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0">
                            {getStatusBadge(restaurant)}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditRestaurant?.(restaurant)}
                              className="h-8 w-8 p-0"
                              title="Editar restaurante"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                              title="Ver cardápio"
                            >
                              <a
                                href={`/menu/${restaurant.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Warning for blocked/banned - Compact */}
                    {((restaurant as any).is_blocked || (restaurant as any).is_banned) && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md mt-3">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                        <span className="text-xs text-yellow-800 truncate">
                          {(restaurant as any).is_banned ? 'Restaurante banido' : 'Restaurante bloqueado'}
                        </span>
                      </div>
                    )}
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