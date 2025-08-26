"use client"

import { useState, useEffect } from "react"
import { ChefHat, Clock } from "lucide-react"
import type { Restaurant } from "@/lib/db"

interface PublicMenuHeaderProps {
  restaurant: Restaurant
}

export function PublicMenuHeader({ restaurant }: PublicMenuHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="relative bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-[url('/elegant-restaurant-interior.png')] bg-cover bg-center opacity-20" />

      <div className="relative container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url || "/placeholder.svg"}
                alt={`${restaurant.name} logo`}
                className="h-16 w-16 rounded-full object-cover border-2 border-secondary-foreground/20"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-secondary-foreground" />
              </div>
            )}
          </div>

          {/* Restaurant Name */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-secondary-foreground/80 mt-2 max-w-2xl mx-auto">{restaurant.description}</p>
            )}
          </div>

          {/* Current Time */}
          <div className="flex items-center justify-center gap-2 text-secondary-foreground/70">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
