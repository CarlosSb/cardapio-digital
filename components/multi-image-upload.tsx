"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Plus } from "lucide-react"

interface MultiImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  label?: string
  className?: string
}

export function MultiImageUpload({ value = [], onChange, maxImages = 3, label = "Upload Images", className }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>(value)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check limit
    if (previews.length + files.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitido`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadedCount(0)
    setTotalFiles(files.length)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const data = await response.json()
        setUploadedCount(prev => prev + 1)
        setUploadProgress(((index + 1) / files.length) * 100)
        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      const newPreviews = [...previews, ...urls]
      setPreviews(newPreviews)
      onChange(newPreviews)
      setUploadProgress(100)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Falha no upload de uma ou mais imagens. Tente novamente.")
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        setUploadProgress(0)
        setUploadedCount(0)
      }, 2000)
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onChange(newPreviews)
  }

  const canAddMore = previews.length < maxImages

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700">
        {label} ({previews.length}/{maxImages})
      </Label>

      <div className="mt-2 space-y-2">
        {/* Existing images */}
        {previews.map((url, index) => (
          <div key={index} className="relative">
            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={url || "/placeholder.svg"} alt={`Imagem ${index + 1}`} className="max-h-full max-w-full object-contain mx-auto" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Upload area */}
        {canAddMore && (
          <div>
            <Label htmlFor="multi-image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  <Plus className="w-6 h-6 mb-2 text-gray-500" />
                  <p className="text-xs text-gray-500">
                    Adicionar imagem
                  </p>
                </div>
              </div>
            </Label>
            <Input
              id="multi-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-2 space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <div className="flex items-center text-sm text-gray-600">
            <Upload className="animate-spin h-4 w-4 mr-2" />
            Fazendo upload... {uploadedCount}/{totalFiles} imagens
          </div>
        </div>
      )}
    </div>
  )
}