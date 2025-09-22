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
    <header className="relative overflow-hidden">
      {/* Gradiente de fundo moderno */}
      <div className="absolute inset-0 gradient-primary opacity-90" />

      {/* Background pattern sutil */}
      <div className="absolute inset-0 bg-[url('/elegant-restaurant-interior.png')] bg-cover bg-center opacity-10" />

      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Logo moderno */}
          <div className="flex justify-center">
            <div className="relative">
              {restaurant.logo_url ? (
                <div className="relative">
                  <img
                    src={restaurant.logo_url || "/placeholder.svg"}
                    alt={`${restaurant.name} logo`}
                    className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl object-cover shadow-xl border-4 border-white/20 backdrop-blur-sm"
                  />
                  <div className="absolute -inset-2 bg-white/20 rounded-3xl blur-lg -z-10" />
                </div>
              ) : (
                <div className="relative">
                  <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30">
                    <ChefHat className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-white/20 rounded-3xl blur-lg -z-10" />
                </div>
              )}
            </div>
          </div>

          {/* Nome do restaurante com tipografia moderna */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p className="text-white/90 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                {restaurant.description}
              </p>
            )}
          </div>

          {/* Horário com badge moderno */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <Clock className="h-4 w-4 text-white" />
            <span className="text-white font-medium">{currentTime}</span>
          </div>

          {/* Indicador de abertura */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-100 text-sm font-medium">Aberto agora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </header>
  )
}
