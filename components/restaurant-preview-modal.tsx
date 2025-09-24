"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string | null
  owner_email: string
  logo_url: string | null
  menu_display_mode: 'grid' | 'list'
  created_at: Date
}

interface RestaurantPreviewModalProps {
  restaurant: Restaurant | null
  isOpen: boolean
  onClose: () => void
}

export function RestaurantPreviewModal({ restaurant, isOpen, onClose }: RestaurantPreviewModalProps) {
  if (!restaurant) return null

  const menuUrl = `${window.location.origin}/menu/${restaurant.slug}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full overflow-hidden p-0" showCloseButton={false}>
        <div className="relative w-full h-full bg-black">
          {/* Minimal Floating Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-3">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Compact Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                  aria-label="Fechar modal"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Compact Title */}
                <h2 className="text-sm md:text-base font-semibold text-white truncate">
                  {restaurant.name}
                </h2>
              </div>

              {/* Compact Open Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(menuUrl, '_blank')}
                className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border-0 h-8 px-3 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Nova Aba
              </Button>
            </div>
          </div>

          {/* Full-Screen Iframe */}
          <iframe
            src={menuUrl}
            className="w-full h-full border-0"
            title={`Menu do ${restaurant.name}`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}