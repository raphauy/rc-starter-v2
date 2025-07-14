"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, AlertTriangle, Settings } from "lucide-react"
import { updateWorkspaceAction, deleteWorkspaceAction, deleteWorkspaceImageAction } from "../../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WorkspaceSettingsFormProps {
  workspace: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)
  const [deletingWorkspace, setDeletingWorkspace] = useState(false)
  const [imagePreview, setImagePreview] = useState(workspace.image)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = await updateWorkspaceAction(workspace.id, formData)
      
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error actualizando workspace")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 2MB")
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Debes seleccionar una imagen")
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("name", workspace.name)
      formData.append("slug", workspace.slug)
      formData.append("description", workspace.description || "")
      formData.append("image", file)

      const result = await updateWorkspaceAction(workspace.id, formData)

      if (result.success) {
        // Crear preview local
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        toast.success("Imagen actualizada")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al subir la imagen")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    setDeletingImage(true)

    try {
      const result = await deleteWorkspaceImageAction(workspace.id)

      if (result.success) {
        setImagePreview(null)
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando imagen")
    } finally {
      setDeletingImage(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    setDeletingWorkspace(true)

    try {
      const result = await deleteWorkspaceAction(workspace.id)

      if (result.success) {
        toast.success(result.message)
        router.push("/admin/workspaces")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando workspace")
    } finally {
      setDeletingWorkspace(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Configuración General */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configuración General</CardTitle>
          </div>
          <CardDescription>
            Información básica del workspace
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={workspace.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  defaultValue={workspace.slug}
                  pattern="^[a-z0-9-]+$"
                  title="Solo letras minúsculas, números y guiones"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El slug no se puede cambiar después de la creación
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del workspace (opcional)"
                defaultValue={workspace.description || ""}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Imagen del Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del Workspace</CardTitle>
          <CardDescription>
            Personaliza la imagen que representa a este workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imagePreview || undefined} alt={workspace.name} />
              <AvatarFallback>
                {workspace.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>Subir imagen</span>
                </div>
              </Label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="hidden"
              />
              
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteImage}
                  disabled={deletingImage}
                >
                  {deletingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            JPG, PNG o WebP. Máximo 2MB. Recomendado: 200x200px
          </p>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          </div>
          <CardDescription>
            Acciones irreversibles para este workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Eliminar Workspace</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción eliminará permanentemente el workspace y todos sus datos. 
              Esta acción no se puede deshacer.
            </p>
            
            <Button 
              variant="destructive"
              onClick={() => {
                const confirmDelete = () => {
                  toast.dismiss()
                  handleDeleteWorkspace()
                }
                
                toast.error(
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold">¿Eliminar workspace?</p>
                    <p className="text-sm">
                      Esta acción eliminará permanentemente el workspace &quot;{workspace.name}&quot; 
                      y todos sus datos asociados.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={confirmDelete}
                      >
                        Sí, eliminar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.dismiss()}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>,
                  {
                    duration: Infinity,
                  }
                )
              }}
              disabled={deletingWorkspace}
            >
              {deletingWorkspace ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar Workspace"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}