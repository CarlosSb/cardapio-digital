"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { ChefHat } from "lucide-react"
import type { MenuItem } from "@/lib/db"

interface ItemDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  if (!item) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const images = (item as any).image_urls && (item as any).image_urls.length > 0 ? (item as any).image_urls : (item.image_url ? [item.image_url] : [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" showCloseButton={false}>
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Carousel or Placeholder */}
          {images.length > 0 ? (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((imageUrl: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`${item.name} - imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                        {/* Overlay with title and price */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.name}</h2>
                          <p className="text-xl font-semibold">{formatPrice(Number(item.price))}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Sem imagem</p>
              </div>
              {/* Overlay for no image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.name}</h2>
                <p className="text-xl font-semibold">{formatPrice(Number(item.price))}</p>
              </div>
            </div>
          )}

          {/* Content below image */}
          <div className="p-6 space-y-4">
            {/* Description */}
            {item.description && (
              <div>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center justify-between">
              <Badge variant={item.is_available ? "default" : "destructive"}>
                {item.is_available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}