"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Shield, Edit, Building2, Calendar, RefreshCw } from "lucide-react"
import { BlockBanDialog } from "@/components/block-ban-dialog"
import { UserEditModal } from "@/components/user-edit-modal"
import { UserRestaurantsModal } from "@/components/user-restaurants-modal"
import { RestaurantEditModal } from "@/components/restaurant-edit-modal"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal states
  const [blockBanDialog, setBlockBanDialog] = useState<{
    type: 'user'
    item: any
  } | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [viewingUserRestaurants, setViewingUserRestaurants] = useState<any>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockBan = async (action: 'block' | 'ban', reason: string) => {
    if (!blockBanDialog) return

    try {
      const endpoint = action === 'block' ? '/api/admin/users/block' : '/api/admin/users/ban'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: blockBanDialog.item.id,
          action: action === 'block' ? (blockBanDialog.item.is_blocked ? 'unblock' : 'block') : 'ban',
          reason
        })
      })

      if (response.ok) {
        setUsers(prev => prev.map(u =>
          u.id === blockBanDialog.item.id
            ? { ...u, is_blocked: action === 'block' ? !u.is_blocked : false, is_banned: action === 'ban' || u.is_banned }
            : u
        ))
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
        // Reload user restaurants modal to show updated data
        setViewingUserRestaurants((prev: any) => prev ? { ...prev } : null)
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

  const getStatusBadge = (user: any) => {
    if (user.is_banned) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Banido
      </Badge>
    }
    if (user.is_blocked) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Bloqueado
      </Badge>
    }
    return <Badge variant="default" className="flex items-center gap-1">
      <Users className="h-3 w-3" />
      Ativo
    </Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie usuários e suas permissões ({filteredUsers.length} usuários)
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <Button
            onClick={loadUsers}
            variant="outline"
            size="sm"
            className="gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filters - Mobile First */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
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

      {/* Users List - Mobile First */}
      <div className="grid gap-3 sm:gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{user.name || 'Sem nome'}</h3>
                    <div className="flex-shrink-0">
                      {getStatusBadge(user)}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingUserRestaurants(user)}
                    className="gap-1 text-xs sm:text-sm"
                  >
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Ver Restaurantes</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBlockBanDialog({ type: 'user', item: user })}
                    className="gap-1 text-xs sm:text-sm"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Moderar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Tente ajustar os filtros de busca ou status.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <BlockBanDialog
        isOpen={!!blockBanDialog}
        onClose={() => setBlockBanDialog(null)}
        onConfirm={handleBlockBan}
        entityType="user"
        entityName={blockBanDialog?.item?.name || blockBanDialog?.item?.email || ''}
        currentStatus={{
          isBlocked: blockBanDialog?.item?.is_blocked || false,
          isBanned: blockBanDialog?.item?.is_banned || false
        }}
      />

      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(updatedUser) => {
          setUsers(prev =>
            prev.map(u => u.id === updatedUser.id ? updatedUser : u)
          )
          setEditingUser(null)
        }}
      />

      <UserRestaurantsModal
        user={viewingUserRestaurants}
        isOpen={!!viewingUserRestaurants}
        onClose={() => setViewingUserRestaurants(null)}
        onEditRestaurant={setEditingRestaurant}
        onPreviewRestaurant={() => {}}
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