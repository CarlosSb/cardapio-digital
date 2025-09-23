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
import { MultiImageUpload } from "@/components/multi-image-upload"
import type { Category } from "@/lib/db"

interface MenuItemFormProps {
  restaurantId: string
  categories: Category[]
  maxImages?: number
}

export function MenuItemForm({ restaurantId, categories, maxImages = 3 }: MenuItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageUrls, setImageUrls] = useState<string[]>([])
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
      image_url: imageUrls[0] || null, // Keep for backward compatibility
      image_urls: imageUrls,
      category_id: selectedCategory,
      restaurant_id: restaurantId,
      is_available: isAvailable,
    }

    if (!data.category_id) {
      setError("Selecione uma categoria")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        e.currentTarget.reset()
        setSelectedCategory("")
        setIsAvailable(true)
        setImageUrls([])
        router.refresh()
      } else {
        setError(result.error || "Erro ao criar item")
      }
    } catch (error) {
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Prato</Label>
          <Input id="name" name="name" placeholder="Ex: Hambúrguer Artesanal" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="25.90" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
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
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descreva os ingredientes e características do prato..."
          rows={3}
        />
      </div>

      <MultiImageUpload
        value={imageUrls}
        onChange={setImageUrls}
        maxImages={maxImages}
        label="Imagens do Prato"
        className="space-y-2"
      />

      <div className="flex items-center space-x-2">
        <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
        <Label htmlFor="is_available">Item disponível</Label>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Criando..." : "Criar Item"}
      </Button>
    </form>
  )
}
