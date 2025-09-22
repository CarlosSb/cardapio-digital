"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, QrCode, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { downloadQRCodeHighRes } from "@/lib/utils"

interface QRCodeGeneratorProps {
  restaurantSlug: string
  restaurantName: string
}

export function QRCodeGenerator({ restaurantSlug, restaurantName }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

 const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    setMenuUrl(`${window.location.origin}/menu/${restaurantSlug}`);
  }, [restaurantSlug]);

  const generateQRCode = async (menuUrl: string) => {
    setIsGenerating(true)
    try {
      // Dynamic import to avoid SSR issues
      const QRCode = (await import("qrcode")).default

      const canvas = canvasRef.current
      if (!canvas) return

      await QRCode.toCanvas(canvas, menuUrl, {
        width: 175,
        margin: 2,
        color: {
          dark: "#0891b2", // cyan-600
          light: "#ffffff",
        },
      })

      // Convert canvas to data URL for download
      const dataUrl = canvas.toDataURL("image/png")
      setQrCodeDataUrl(dataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR code. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    setIsDownloading(true)
    try {
      if (!qrCodeDataUrl) return
      await downloadQRCodeHighRes(menuUrl, restaurantSlug)

    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Erro",
        description: "Não foi possível baixar o QR code. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const copyUrl = async (menuUrl: string) => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "URL copiada",
        description: "A URL do cardápio foi copiada para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a URL.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (restaurantSlug && menuUrl) {
      generateQRCode(menuUrl)
    }
  }, [restaurantSlug, menuUrl])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5 text-cyan-600" />
          QR Code do Cardápio
        </CardTitle>
        <CardDescription>Compartilhe este QR code para que os clientes acessem seu cardápio digital</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 h-full">
        <div className="flex justify-center">
          <div className="p-4 mb-2 bg-white rounded-lg border-2 border-gray-200 w-48 h-48 relative flex items-center justify-center">
            <canvas ref={canvasRef} className={`${isGenerating ? "opacity-50" : "opacity-100"} transition-opacity`} />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">URL do Cardápio:</p>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <code className="flex-1 text-xs text-gray-600 truncate">{menuUrl}</code>
            <Button variant="ghost" size="sm" onClick={() => copyUrl(menuUrl)} className="h-8 w-8 p-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => generateQRCode(menuUrl)} disabled={isGenerating} variant="outline" className="flex-1 bg-transparent">
            {isGenerating ? "Gerando..." : "Regenerar QR Code"}
          </Button>

          <Button onClick={() => downloadQRCode()} disabled={!qrCodeDataUrl || isGenerating || isDownloading} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Baixando..." : "Baixar PNG"}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Dica: Imprima este QR code e coloque nas mesas do seu restaurante!</p>
        </div>
      </CardContent>
    </Card>
  )
}
