"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, QrCode, Copy, Check, Settings, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  restaurantSlug: string
  restaurantName: string
  customLogoUrl?: string | null
  isPaidPlan?: boolean
}

export function QRCodeGenerator({ restaurantSlug, restaurantName, customLogoUrl, isPaidPlan }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [logoWarning, setLogoWarning] = useState<string | null>(null)
  const [menuUrl, setMenuUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMenuUrl(`${window.location.origin}/menu/${restaurantSlug}`)
    }
  }, [restaurantSlug])

  const generateQRCode = async (menuUrl: string) => {
    setIsGenerating(true)
    setLogoWarning(null)

    try {
      if (typeof window === 'undefined') return

      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error('Canvas não encontrado')
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Não foi possível obter contexto 2D do canvas')
      }

      // Configurar canvas com ultra-alta qualidade para melhor escaneabilidade
      canvas.width = 400
      canvas.height = 400
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Configurar alta qualidade de renderização
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Gerar QR base com margem otimizada e alta correção de erro
      await QRCode.toCanvas(canvas, menuUrl, {
        width: 400,
        margin: 3,
        color: {
          dark: "#0891b2",
          light: "#ffffff",
        },
        errorCorrectionLevel: 'H', // Alta correção de erro para melhor robustez
      })

      // Aplicar logo baseado no plano do usuário
      const logoSize = 75 // Logo proporcional (18.75% de 400px)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Desenhar fundo branco para o logo com padding reduzido
      const bgPadding = 4
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(
        centerX - logoSize/2 - bgPadding,
        centerY - logoSize/2 - bgPadding,
        logoSize + bgPadding * 2,
        logoSize + bgPadding * 2
      )

      // Determinar qual logo usar baseado no plano
      let logoSrc: string

      if (isPaidPlan && customLogoUrl) {
        // Usar logo personalizado para planos pagos
        logoSrc = customLogoUrl.startsWith('http') ? customLogoUrl : `${window.location.origin}${customLogoUrl}`
      } else {
        // Usar logo padrão da plataforma
        logoSrc = '/digital-menu-logo.svg'
      }

      // Carregar e desenhar logo
      const logoImg = new Image()
      logoImg.onload = () => {
        // Aplicar sombra sutil para profundidade
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1

        // Desenhar logo perfeitamente centralizado
        ctx.drawImage(
          logoImg,
          centerX - logoSize/2,
          centerY - logoSize/2,
          logoSize,
          logoSize
        )

        // Limpar sombra
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Gerar data URL para preview
        const dataUrl = canvas.toDataURL('image/png')
        setQrCodeDataUrl(dataUrl)
        setLogoWarning(null)
      }

      logoImg.onerror = () => {
        // Se o logo personalizado falhar, tentar usar logo padrão como fallback
        if (logoSrc !== '/digital-menu-logo.svg') {
          console.warn('Logo personalizado falhou, usando logo padrão')
          const fallbackImg = new Image()
          fallbackImg.onload = () => {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1

            ctx.drawImage(
              fallbackImg,
              centerX - logoSize/2,
              centerY - logoSize/2,
              logoSize,
              logoSize
            )

            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            const dataUrl = canvas.toDataURL('image/png')
            setQrCodeDataUrl(dataUrl)
            setLogoWarning('Logo personalizado falhou - usando logo padrão')
          }

          fallbackImg.onerror = () => {
            // Mesmo fallback falhou, gerar sem logo
            const dataUrl = canvas.toDataURL('image/png')
            setQrCodeDataUrl(dataUrl)
            setLogoWarning('Logos não puderam ser carregados - QR code gerado sem logo')
          }

          fallbackImg.src = '/digital-menu-logo.svg'
        } else {
          // Mesmo logo padrão falhou
          const dataUrl = canvas.toDataURL('image/png')
          setQrCodeDataUrl(dataUrl)
          setLogoWarning('Logo não pôde ser carregado - QR code gerado sem logo')
        }
      }

      logoImg.src = logoSrc

    } catch (error) {
      console.error("Erro na geração de QR code:", error)

      // Fallback: gerar QR básico
      try {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = 400
          canvas.height = 400

          await QRCode.toCanvas(canvas, menuUrl, {
            width: 400,
            margin: 3,
            color: { dark: "#0891b2", light: "#ffffff" },
            errorCorrectionLevel: 'H',
          })

          const dataUrl = canvas.toDataURL("image/png")
          setQrCodeDataUrl(dataUrl)
          setLogoWarning('Erro na aplicação do logo - QR code básico gerado')
        }
      } catch (fallbackError) {
        console.error("Mesmo fallback falhou:", fallbackError)
        toast({
          title: "Erro",
          description: "Não foi possível gerar o QR code. Tente novamente.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    setIsDownloading(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error('Canvas não encontrado para download')
      }

      // Criar canvas de ultra-alta resolução (mínimo 1024x1024px para qualidade excepcional)
      const highResCanvas = document.createElement('canvas')
      const highResCtx = highResCanvas.getContext('2d')
      if (!highResCtx) {
        throw new Error('Não foi possível criar contexto de alta resolução')
      }

      // Escala para garantir mínimo 1600x1600px (4x para 400px base = 1600px)
      const minSize = 1600
      const scale = Math.max(4, Math.ceil(minSize / canvas.width))
      highResCanvas.width = canvas.width * scale   // Mínimo 1024px
      highResCanvas.height = canvas.height * scale // Mínimo 1024px

      // Configurações para máxima qualidade
      highResCtx.imageSmoothingEnabled = true
      highResCtx.imageSmoothingQuality = 'high'

      // Desenhar imagem em ultra-alta resolução
      highResCtx.drawImage(canvas, 0, 0, highResCanvas.width, highResCanvas.height)

      // Converter para blob de alta qualidade e download
      highResCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Falha ao gerar blob da imagem')
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `qr-code-${restaurantSlug || 'cardapio'}-hd.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Download concluído",
          description: `QR code ${highResCanvas.width}x${highResCanvas.height}px baixado com sucesso!`,
        })
      }, 'image/png', 1.0) // Máxima qualidade PNG

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
    if (typeof window === 'undefined') return

    if (restaurantSlug && menuUrl) {
      generateQRCode(menuUrl)
    }
  }, [restaurantSlug, menuUrl])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
          <QrCode className="h-5 w-5 text-primary" />
          QR Code Personalizado
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          QR code profissional com logo centralizado para maior reconhecimento da marca
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative p-4 bg-white rounded-lg border border-border shadow-md w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className={`${isGenerating ? "opacity-50" : "opacity-100"} transition-opacity duration-300 w-full h-full max-w-full max-h-full`}
              width={320}
              height={320}
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-xs text-muted-foreground">Gerando...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {logoWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{logoWarning}</span>
          </div>
        )}

        {!logoWarning && qrCodeDataUrl && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>QR code gerado com sucesso! Logo centralizado incluído.</span>
          </div>
        )}

        {/* URL Display */}
        <div className="space-y-2">
          <p className="text-sm font-medium">URL do Cardápio:</p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <code className="flex-1 text-xs font-mono break-all text-muted-foreground">{menuUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyUrl(menuUrl)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => generateQRCode(menuUrl)}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 touch-manipulation"
            aria-label={isGenerating ? "Gerando QR code" : "Regenerar QR code"}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isGenerating ? "Gerando..." : "Regenerar QR Code"}
          </Button>

          <Button
            onClick={() => downloadQRCode()}
            disabled={!qrCodeDataUrl || isGenerating || isDownloading}
            className="flex-1 touch-manipulation"
            aria-label={isDownloading ? "Baixando QR code" : "Baixar QR code em alta resolução"}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Baixando..." : "Baixar PNG (1024px+)"}
          </Button>
        </div>

        {/* Technical Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p className="font-medium">Especificações Técnicas:</p>
          <p>Resolução: 1600x1600px+ • Logo: 18.75% centralizado • Correção: Alta (H)</p>
          <p className="text-primary font-medium">Qualidade profissional para impressão e digital</p>
        </div>
      </CardContent>
    </Card>
  )
}
