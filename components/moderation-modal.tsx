"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  Shield,
  Users,
  Building2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Ban,
  UserCheck,
  RefreshCw
} from "lucide-react"
import { BlockBanDialog } from "@/components/block-ban-dialog"
import { RestaurantEditModal } from "@/components/restaurant-edit-modal"
import { RestaurantPreviewModal } from "@/components/restaurant-preview-modal"

interface ModerationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModerationStats {
  totalUsers: number
  blockedUsers: number
  bannedUsers: number
  totalRestaurants: number
  blockedRestaurants: number
  bannedRestaurants: number
}

export function ModerationModal({ isOpen, onClose }: ModerationModalProps) {
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal states
  const [blockBanDialog, setBlockBanDialog] = useState<{
    type: 'user' | 'restaurant'
    item: any
  } | null>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [previewingRestaurant, setPreviewingRestaurant] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

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

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(
    (activeTab === 'users' ? filteredUsers.length : filteredRestaurants.length) / itemsPerPage
  )

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden z-[9999]">
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-2 pr-8">
              <Shield className="h-5 w-5" />
              Centro de Moderação
            </DialogTitle>
            <DialogDescription>
              Gerencie usuários e restaurantes com ferramentas avançadas de moderação
            </DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-muted"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">Usuários</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.blockedUsers}</div>
                  <div className="text-xs text-muted-foreground">Bloqueados</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
                  <div className="text-xs text-muted-foreground">Banidos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalRestaurants}</div>
                  <div className="text-xs text-muted-foreground">Restaurantes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.blockedRestaurants}</div>
                  <div className="text-xs text-muted-foreground">Bloqueados</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.bannedRestaurants}</div>
                  <div className="text-xs text-muted-foreground">Banidos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters - Mobile First */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
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
              <Button
                variant="outline"
                onClick={loadData}
                disabled={loading}
                size="sm"
                className="gap-1 text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2" onClick={() => setCurrentPage(1)}>
                <Users className="h-4 w-4" />
                Usuários ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="flex items-center gap-2" onClick={() => setCurrentPage(1)}>
                <Building2 className="h-4 w-4" />
                Restaurantes ({filteredRestaurants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <div className="space-y-2">
                {paginatedUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="font-medium text-sm sm:text-base truncate">{user.name || 'Sem nome'}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                          <div className="flex-shrink-0">
                            {getStatusBadge(user)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBlockBanDialog({ type: 'user', item: user })}
                            className="text-xs sm:text-sm gap-1"
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
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>

            <TabsContent value="restaurants" className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <div className="space-y-2">
                {paginatedRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="font-medium text-sm sm:text-base truncate">{restaurant.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">Slug: {restaurant.slug}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            Criado em {new Date(restaurant.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                          <div className="flex-shrink-0">
                            {getStatusBadge(restaurant)}
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewingRestaurant(restaurant)}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              title="Ver menu"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRestaurant(restaurant)}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              title="Editar"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBlockBanDialog({ type: 'restaurant', item: restaurant })}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              title="Moderar"
                            >
                              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
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
    </>
  )
}