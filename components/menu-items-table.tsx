"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { MenuItemEditDialog } from "@/components/menu-item-edit-dialog"
import type { MenuItem, Category } from "@/lib/db"

interface MenuItemWithCategory extends MenuItem {
  category_name: string
}

interface MenuItemsTableProps {
  menuItems: MenuItemWithCategory[]
  categories: Category[]
  restaurantId: string
}

export function MenuItemsTable({ menuItems, categories, restaurantId }: MenuItemsTableProps) {
  const [editingItem, setEditingItem] = useState<MenuItemWithCategory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao excluir item")
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/menu-items/${itemId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !isAvailable }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao alterar disponibilidade")
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum item cadastrado ainda.</p>
        <p className="text-sm text-muted-foreground">Adicione seu primeiro item usando a aba "Adicionar Item".</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.category_name || "Sem categoria"}</Badge>
              </TableCell>
              <TableCell className="font-medium">{formatPrice(Number(item.price))}</TableCell>
              <TableCell>
                <Badge variant={item.is_available ? "default" : "secondary"}>
                  {item.is_available ? "Disponível" : "Indisponível"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    disabled={isLoading}
                  >
                    {item.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingItem && (
        <MenuItemEditDialog
          menuItem={editingItem}
          categories={categories}
          restaurantId={restaurantId}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  )
}
