"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Restaurant } from "@/lib/db"

interface RestaurantEditModalProps {
  restaurant: Restaurant | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedRestaurant: Partial<Restaurant>) => void
  isLoading?: boolean
}

export function RestaurantEditModal({
  restaurant,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: RestaurantEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    menu_display_mode: 'grid' as 'grid' | 'list'
  })

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        logo_url: restaurant.logo_url || '',
        menu_display_mode: restaurant.menu_display_mode || 'grid'
      })
    }
  }, [restaurant])

  const handleSave = () => {
    if (!formData.name.trim()) return

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      logo_url: formData.logo_url.trim() || null,
      menu_display_mode: formData.menu_display_mode
    })
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      menu_display_mode: 'grid'
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Restaurante</DialogTitle>
          <DialogDescription>
            Atualize as informações do restaurante. Apenas campos permitidos serão salvos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Restaurante *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do restaurante"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite uma descrição para o restaurante"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL do Logo</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://exemplo.com/logo.png"
              disabled={isLoading}
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu_display_mode">Modo de Exibição do Menu</Label>
            <Select
              value={formData.menu_display_mode}
              onValueChange={(value: 'grid' | 'list') =>
                setFormData(prev => ({ ...prev, menu_display_mode: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grade (Cards)</SelectItem>
                <SelectItem value="list">Lista (Linhas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}