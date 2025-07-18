"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceBySlug,
  getWorkspaceById,
  type CreateWorkspaceData 
} from "@/services/workspace-service"
import { replaceWorkspaceImage, deleteImage } from "@/services/upload-service"

export async function createWorkspaceAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File | null

    // Validar que el slug no exista
    const existingWorkspace = await getWorkspaceBySlug(slug)
    if (existingWorkspace) {
      throw new Error("Ya existe un workspace con este slug")
    }

    // Crear el workspace primero
    const workspaceData: CreateWorkspaceData = {
      name,
      slug,
      description: description || undefined
    }

    const newWorkspace = await createWorkspace(workspaceData)

    // Si se subió una imagen, procesarla
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await replaceWorkspaceImage({
        file: imageFile,
        workspaceId: newWorkspace.id
      })
      
      // Actualizar el workspace con la URL de la imagen
      await updateWorkspace(newWorkspace.id, {
        image: uploadResult.url
      })
    }

    revalidatePath("/admin/workspaces")
    return { success: true, message: "Workspace creado correctamente" }
  } catch (error) {
    console.error("Error creando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando workspace" 
    }
  }
}

export async function updateWorkspaceAction(workspaceId: string, formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File | null

    // Validar que el slug no exista (excepto el actual)
    const existingWorkspace = await getWorkspaceBySlug(slug)
    if (existingWorkspace && existingWorkspace.id !== workspaceId) {
      throw new Error("Ya existe un workspace con este slug")
    }

    // Obtener workspace actual para verificar si tiene imagen
    const currentWorkspace = await getWorkspaceById(workspaceId)
    if (!currentWorkspace) {
      throw new Error("Workspace no encontrado")
    }

    let imageUrl = currentWorkspace.image

    // Si se subió una nueva imagen, procesarla
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await replaceWorkspaceImage({
        file: imageFile,
        workspaceId,
        currentImageUrl: currentWorkspace.image || undefined
      })
      imageUrl = uploadResult.url
    }

    // Actualizar el workspace
    await updateWorkspace(workspaceId, {
      name,
      slug,
      description: description || undefined,
      image: imageUrl || undefined
    })

    revalidatePath("/admin/workspaces")
    return { success: true, message: "Workspace actualizado correctamente" }
  } catch (error) {
    console.error("Error actualizando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando workspace" 
    }
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    await deleteWorkspace(workspaceId)

    revalidatePath("/admin/workspaces")
    return { success: true, message: "Workspace eliminado correctamente" }
  } catch (error) {
    console.error("Error eliminando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando workspace" 
    }
  }
}

export async function deleteWorkspaceImageAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    // Obtener workspace actual
    const workspace = await getWorkspaceById(workspaceId)
    if (!workspace) {
      throw new Error("Workspace no encontrado")
    }

    // Si tiene imagen, eliminarla
    if (workspace.image) {
      await deleteImage({ url: workspace.image })
      
      // Actualizar workspace para quitar la referencia a la imagen
      await updateWorkspace(workspaceId, {
        image: undefined
      })
    }

    revalidatePath("/admin/workspaces")
    revalidatePath(`/admin/workspaces/${workspaceId}`)
    return { success: true, message: "Imagen eliminada correctamente" }
  } catch (error) {
    console.error("Error eliminando imagen:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando imagen" 
    }
  }
}