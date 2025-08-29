import type { IncomingHttpHeaders } from "http"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'
import QRCode from "qrcode"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Defina a função hashPassword
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

//aplica um deley na requisição
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getOriginUrl(headers: IncomingHttpHeaders): string {
  const proto = headers["x-forwarded-proto"] || "http"
  const host = headers["x-forwarded-host"] || headers.host || "localhost:3000"
  return `${proto}://${host}`
}

export const downloadQRCodeHighRes = async (menuUrl: string, restaurantSlug: string, scale = 4) => {
  try {
    // Primeiro, cria um canvas temporário grande
    const tempCanvas = document.createElement("canvas")
    const baseSize = 1024 // tamanho base do QR code
    tempCanvas.width = baseSize * scale
    tempCanvas.height = baseSize * scale

    const ctx = tempCanvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context not available")

    // Gera o QR code diretamente nesse canvas temporário
    await QRCode.toCanvas(tempCanvas, menuUrl, {
      width: tempCanvas.width,
      margin: 2,
      color: {
        dark: "#0891b2",
        light: "#ffffff",
      },
    })

    // Converte para data URL
    const dataUrl = tempCanvas.toDataURL("image/png")

    // Cria o link e dispara o download
    const link = document.createElement("a")
    link.download = `qr-code-${restaurantSlug}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Erro ao gerar QR code para download:", error)
  }
}
