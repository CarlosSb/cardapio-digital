"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface RestaurantCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (restaurant: any) => void
}

export function RestaurantCreateModal({ isOpen, onClose, onCreate }: RestaurantCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    owner_email: '',
    logo_url: '',
    menu_display_mode: 'grid' as 'grid' | 'list'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      // Here you would typically make an API call to create the restaurant
      // For now, we'll just simulate the creation
      const newRestaurant = {
        id: Date.now().toString(), // Temporary ID
        ...formData,
        created_at: new Date()
      }
      onCreate(newRestaurant)
      onClose()
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        owner_email: '',
        logo_url: '',
        menu_display_mode: 'grid'
      })
    } catch (error) {
      console.error('Error creating restaurant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Restaurante</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Restaurante *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do restaurante"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="slug-do-restaurante"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Descrição do restaurante"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner_email">Email do Proprietário *</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => handleInputChange('owner_email', e.target.value)}
                placeholder="proprietario@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu_display_mode">Modo de Exibição do Menu</Label>
              <Select
                value={formData.menu_display_mode}
                onValueChange={(value: 'grid' | 'list') => handleInputChange('menu_display_mode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL do Logo</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Restaurante
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}