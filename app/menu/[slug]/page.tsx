import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { PublicMenuHeader } from "@/components/public-menu-header"
import { PublicMenuWrapper } from "@/components/public-menu-wrapper"
import type { Restaurant, Category, MenuItem } from "@/lib/db"

interface MenuItemWithCategory extends MenuItem {
  category_name: string
  category_display_order: number
  image_urls: string[] | null
}

interface CategoryWithItems extends Category {
  items: MenuItemWithCategory[]
}

interface PublicMenuPageProps {
  params: {
    slug: string
  }
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = params

  // Get restaurant by slug
  const restaurants = await sql`
    SELECT *, logo_url FROM restaurants
    WHERE slug = ${slug}
    LIMIT 1
  `

  if (restaurants.length === 0) {
    notFound()
  }

  const restaurant = restaurants[0] as Restaurant

  // Get categories and menu items
  const [categories, menuItems] = await Promise.all([
    sql`
      SELECT * FROM categories
      WHERE restaurant_id = ${restaurant.id}
      ORDER BY display_order ASC
    ` as unknown as Promise<Category[]>,
    sql`
      SELECT
        m.*,
        c.name as category_name,
        c.display_order as category_display_order
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ${restaurant.id} AND m.is_available = TRUE
      ORDER BY c.display_order ASC, m.display_order ASC, m.created_at DESC
    ` as unknown as Promise<MenuItemWithCategory[]>,
  ])

  // Group menu items by category
  const menuByCategory = categories.map((category) => ({
    ...category,
    items: menuItems.filter((item) => item.category_id === category.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      <PublicMenuHeader restaurant={restaurant} />
      <PublicMenuWrapper
        restaurant={restaurant}
        menuByCategory={menuByCategory}
        displayMode={restaurant.menu_display_mode}
      />
    </div>
  )
}

export async function generateMetadata({ params }: PublicMenuPageProps) {
  const { slug } = params

  const restaurants = await sql`
    SELECT name, description FROM restaurants 
    WHERE slug = ${slug}
    LIMIT 1
  `

  if (restaurants.length === 0) {
    return {
      title: "Cardápio não encontrado",
    }
  }

  const restaurant = restaurants[0]

  return {
    title: `${restaurant.name} - Cardápio Digital`,
    description: restaurant.description || `Confira o cardápio digital do ${restaurant.name}`,
  }
}
