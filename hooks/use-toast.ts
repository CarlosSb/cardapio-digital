"use client"

interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast({ title, description, variant = "default" }: Toast) {
  // Simple toast implementation - in a real app you'd use a proper toast library
  const message = description ? `${title}: ${description}` : title

  if (variant === "destructive") {
    console.error(message)
    alert(`Erro: ${message}`)
  } else {
    console.log(message)
    alert(message)
  }
}

export function useToast() {
  return { toast }
}
