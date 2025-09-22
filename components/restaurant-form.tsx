"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import type { Restaurant } from "@/lib/db"

interface RestaurantFormProps {
  restaurant: Restaurant | null
  userEmail: string
}

export function RestaurantForm({ restaurant, userEmail }: RestaurantFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoUrl, setLogoUrl] = useState(restaurant?.logo_url || "")
  const [menuDisplayMode, setMenuDisplayMode] = useState<'grid' | 'list'>(restaurant?.menu_display_mode || 'grid')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string,
      logo_url: logoUrl,
      menu_display_mode: menuDisplayMode,
    }

    try {
      const response = await fetch("/api/restaurants", {
        method: restaurant ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: restaurant?.id,
          owner_email: userEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || "Erro ao salvar restaurante")
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
          <Label htmlFor="name">Nome do Restaurante</Label>
          <Input
            id="name"
            name="name"
            defaultValue={restaurant?.name || ""}
            placeholder="Ex: Restaurante do João"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={restaurant?.slug || ""}
            placeholder="Ex: restaurante-do-joao"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={restaurant?.description || ""}
          placeholder="Descreva seu restaurante..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="menuDisplayMode">Modo de Exibição do Cardápio</Label>
        <Select value={menuDisplayMode} onValueChange={(value: 'grid' | 'list') => setMenuDisplayMode(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o modo de exibição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grade (Padrão)</SelectItem>
            <SelectItem value="list">Lista</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Escolha como seus itens do cardápio serão exibidos para os clientes
        </p>
      </div>

      <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo do Restaurante" className="space-y-2" />

      {error && <div className="text-sm text-destructive">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : restaurant ? "Atualizar Restaurante" : "Cadastrar Restaurante"}
      </Button>
    </form>
  )
}
