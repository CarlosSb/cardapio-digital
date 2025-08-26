"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { CategoryEditDialog } from "@/components/category-edit-dialog"
import type { Category } from "@/lib/db"

interface CategoriesTableProps {
  categories: Category[]
  restaurantId: string
}

export function CategoriesTable({ categories, restaurantId }: CategoriesTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao excluir categoria")
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async (categoryId: string, direction: "up" | "down") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao reordenar categoria")
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
        <p className="text-sm text-muted-foreground">
          Adicione sua primeira categoria usando a aba "Adicionar Categoria".
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description || "-"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{category.display_order}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(category.id, "up")}
                    disabled={index === 0 || isLoading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(category.id, "down")}
                    disabled={index === categories.length - 1 || isLoading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingCategory && (
        <CategoryEditDialog
          category={editingCategory}
          restaurantId={restaurantId}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </>
  )
}
