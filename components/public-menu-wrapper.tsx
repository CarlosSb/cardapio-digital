"use client"

import { useEffect, useState } from "react"
import { PublicMenuContent } from "@/components/public-menu-content"
import type { Restaurant, Category, MenuItem } from "@/lib/db"

interface MenuItemWithCategory extends MenuItem {
  category_name: string
  category_display_order: number
}

interface CategoryWithItems extends Category {
  items: MenuItemWithCategory[]
}

interface PublicMenuWrapperProps {
  restaurant: Restaurant
  menuByCategory: CategoryWithItems[]
  displayMode: 'grid' | 'list'
}

export function PublicMenuWrapper({ restaurant, menuByCategory, displayMode }: PublicMenuWrapperProps) {
  const [userDisplayMode, setUserDisplayMode] = useState<'grid' | 'list' | null>(null)

  useEffect(() => {
    // Load user preference from localStorage
    const savedMode = localStorage.getItem(`menu-display-mode-${restaurant.slug}`)
    if (savedMode === 'grid' || savedMode === 'list') {
      setUserDisplayMode(savedMode)
    }
  }, [restaurant.slug])

  return (
    <PublicMenuContent
      restaurant={restaurant}
      menuByCategory={menuByCategory}
      displayMode={displayMode}
      userDisplayMode={userDisplayMode || undefined}
    />
  )
}