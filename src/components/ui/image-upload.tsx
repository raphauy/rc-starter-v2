"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  maxSize?: number // En MB
  accept?: string
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  maxSize = 2,
  accept = "image/*",
  placeholder = "Subir imagen"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      alert(`La imagen debe ser menor a ${maxSize}MB`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Debes seleccionar una imagen")
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Llamar onChange
    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  return (
    <div className={cn("relative", className)}>
      {preview ? (
        <div className="relative group">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-lg cursor-pointer transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground text-center px-2">
            {placeholder}
          </span>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileChange(file)
          }
        }}
        disabled={disabled}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground mt-2">
        JPG, PNG o WebP. Máximo {maxSize}MB. Recomendado: 200x200px
      </p>
    </div>
  )
}