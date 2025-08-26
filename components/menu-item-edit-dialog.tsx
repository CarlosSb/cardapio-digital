"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MenuItem, Category } from "@/lib/db"

interface MenuItemWithCategory extends MenuItem {
  category_name: string
}

interface MenuItemEditDialogProps {
  menuItem: MenuItemWithCategory
  categories: Category[]
  restaurantId: string
  onClose: () => void
}

export function MenuItemEditDialog({ menuItem, categories, restaurantId, onClose }: MenuItemEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(menuItem.category_id || "")
  const [isAvailable, setIsAvailable] = useState(menuItem.is_available)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      image_url: formData.get("image_url") as string,
      category_id: selectedCategory,
      is_available: isAvailable,
    }

    if (!data.category_id) {
      setError("Selecione uma categoria")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/menu-items/${menuItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        onClose()
        router.refresh()
      } else {
        setError(result.error || "Erro ao atualizar item")
      }
    } catch (error) {
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Item do Cardápio</DialogTitle>
          <DialogDescription>Atualize as informações do prato</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Prato</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={menuItem.name}
                placeholder="Ex: Hambúrguer Artesanal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(menuItem.price)}
                placeholder="25.90"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={menuItem.description || ""}
              placeholder="Descreva os ingredientes e características do prato..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image_url">URL da Imagem</Label>
            <Input
              id="edit-image_url"
              name="image_url"
              type="url"
              defaultValue={menuItem.image_url || ""}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="edit-is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label htmlFor="edit-is_available">Item disponível</Label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
