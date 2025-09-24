"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Building2, Search, RefreshCw, AlertTriangle, CheckCircle, Ban, UserCheck } from "lucide-react"
import { BlockBanDialog } from "@/components/block-ban-dialog"
import { RestaurantEditModal } from "@/components/restaurant-edit-modal"
import { RestaurantPreviewModal } from "@/components/restaurant-preview-modal"

interface ModerationStats {
  totalUsers: number
  blockedUsers: number
  bannedUsers: number
  totalRestaurants: number
  blockedRestaurants: number
  bannedRestaurants: number
}

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [stats, setStats] = useState<ModerationStats>({
    totalUsers: 0,
    blockedUsers: 0,
    bannedUsers: 0,
    totalRestaurants: 0,
    blockedRestaurants: 0,
    bannedRestaurants: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal states
  const [blockBanDialog, setBlockBanDialog] = useState<{
    type: 'user' | 'restaurant'
    item: any
  } | null>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [previewingRestaurant, setPreviewingRestaurant] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load users and restaurants in parallel
      const [usersRes, restaurantsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/restaurants')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
        updateStats(usersData, restaurants)
      }

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
        updateStats(users, restaurantsData)
      }
    } catch (error) {
      console.error('Error loading moderation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (usersData: any[], restaurantsData: any[]) => {
    const userStats = {
      totalUsers: usersData.length,
      blockedUsers: usersData.filter(u => u.is_blocked).length,
      bannedUsers: usersData.filter(u => u.is_banned).length
    }

    const restaurantStats = {
      totalRestaurants: restaurantsData.length,
      blockedRestaurants: restaurantsData.filter(r => r.is_blocked).length,
      bannedRestaurants: restaurantsData.filter(r => r.is_banned).length
    }

    setStats({ ...userStats, ...restaurantStats })
  }

  const handleBlockBan = async (action: 'block' | 'ban', reason: string) => {
    if (!blockBanDialog) return

    try {
      const endpoint = blockBanDialog.type === 'user'
        ? (action === 'block' ? '/api/admin/users/block' : '/api/admin/users/ban')
        : (action === 'block' ? '/api/admin/restaurants/block' : '/api/admin/restaurants/ban')

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [blockBanDialog.type === 'user' ? 'userId' : 'restaurantId']: blockBanDialog.item.id,
          action: action === 'block' ? (blockBanDialog.item.is_blocked ? 'unblock' : 'block') : 'ban',
          reason
        })
      })

      if (response.ok) {
        // Update local state
        if (blockBanDialog.type === 'user') {
          setUsers(prev => prev.map(u =>
            u.id === blockBanDialog.item.id
              ? { ...u, is_blocked: action === 'block' ? !u.is_blocked : false, is_banned: action === 'ban' || u.is_banned }
              : u
          ))
        } else {
          setRestaurants(prev => prev.map(r =>
            r.id === blockBanDialog.item.id
              ? { ...r, is_blocked: action === 'block' ? !r.is_blocked : false, is_banned: action === 'ban' || r.is_banned }
              : r
          ))
        }
        loadData() // Refresh stats
        setBlockBanDialog(null)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Error in moderation action:', error)
      alert('Erro ao processar ação de moderação')
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'active' && !user.is_blocked && !user.is_banned) ||
                          (statusFilter === 'blocked' && user.is_blocked) ||
                          (statusFilter === 'banned' && user.is_banned)
    return matchesSearch && matchesStatus
  })

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          restaurant.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'active' && !restaurant.is_blocked && !restaurant.is_banned) ||
                          (statusFilter === 'blocked' && restaurant.is_blocked) ||
                          (statusFilter === 'banned' && restaurant.is_banned)
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (item: any) => {
    if (item.is_banned) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="h-3 w-3" />
        Banido
      </Badge>
    }
    if (item.is_blocked) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Bloqueado
      </Badge>
    }
    return <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Ativo
    </Badge>
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Moderação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários e restaurantes com ferramentas avançadas de moderação
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-xs text-muted-foreground">Usuários</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.blockedUsers}</div>
            <div className="text-xs text-muted-foreground">Bloqueados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
            <div className="text-xs text-muted-foreground">Banidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalRestaurants}</div>
            <div className="text-xs text-muted-foreground">Restaurantes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.blockedRestaurants}</div>
            <div className="text-xs text-muted-foreground">Bloqueados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.bannedRestaurants}</div>
            <div className="text-xs text-muted-foreground">Banidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="blocked">Bloqueados</SelectItem>
                <SelectItem value="banned">Banidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Restaurantes ({filteredRestaurants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{user.name || 'Sem nome'}</h3>
                      {getStatusBadge(user)}
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setBlockBanDialog({ type: 'user', item: user })}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Moderar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-4">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      {getStatusBadge(restaurant)}
                    </div>
                    <p className="text-muted-foreground">Slug: {restaurant.slug}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewingRestaurant(restaurant)}
                    >
                      Ver Menu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRestaurant(restaurant)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBlockBanDialog({ type: 'restaurant', item: restaurant })}
                      className="gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Moderar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <BlockBanDialog
        isOpen={!!blockBanDialog}
        onClose={() => setBlockBanDialog(null)}
        onConfirm={handleBlockBan}
        entityType={blockBanDialog?.type || 'user'}
        entityName={blockBanDialog?.item?.name || blockBanDialog?.item?.email || ''}
        currentStatus={{
          isBlocked: blockBanDialog?.item?.is_blocked || false,
          isBanned: blockBanDialog?.item?.is_banned || false
        }}
      />

      <RestaurantEditModal
        restaurant={editingRestaurant}
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleEditRestaurant}
      />

      <RestaurantPreviewModal
        restaurant={previewingRestaurant}
        isOpen={!!previewingRestaurant}
        onClose={() => setPreviewingRestaurant(null)}
      />
    </div>
  )
}