import { z } from 'zod'

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  price: z.number().positive('Preço deve ser positivo'),
  image_url: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  image_urls: z.array(z.string().url('URL de imagem inválida')).max(7, 'Máximo 7 imagens').optional(),
  category_id: z.string().uuid('ID de categoria inválido'),
  restaurant_id: z.string().uuid('ID de restaurante inválido'),
  is_available: z.boolean(),
})

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>