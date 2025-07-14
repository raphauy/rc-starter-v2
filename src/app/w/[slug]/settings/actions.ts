"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceBySlug,
  getWorkspaceById,
  isUserWorkspaceAdmin,
} from "@/services/workspace-service"
import { replaceWorkspaceImage, deleteImage } from "@/services/upload-service"

export async function updateWorkspaceUserAction(workspaceId: string, formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      throw new Error("No autorizado")
    }

    // Verificar que el usuario sea admin del workspace
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspaceId)
    if (!isAdmin) {
      throw new Error("No tienes permisos para actualizar este workspace")
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

    revalidatePath(`/w/${slug}/settings`)
    revalidatePath(`/w/${slug}`)
    return { success: true, message: "Workspace actualizado correctamente" }
  } catch (error) {
    console.error("Error actualizando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando workspace" 
    }
  }
}

export async function deleteWorkspaceUserAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      throw new Error("No autorizado")
    }

    // Verificar que el usuario sea admin del workspace
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspaceId)
    if (!isAdmin) {
      throw new Error("No tienes permisos para eliminar este workspace")
    }

    await deleteWorkspace(workspaceId)

    revalidatePath("/w")
    return { success: true, message: "Workspace eliminado correctamente" }
  } catch (error) {
    console.error("Error eliminando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando workspace" 
    }
  }
}

export async function deleteWorkspaceImageUserAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      throw new Error("No autorizado")
    }

    // Verificar que el usuario sea admin del workspace
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspaceId)
    if (!isAdmin) {
      throw new Error("No tienes permisos para modificar este workspace")
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

    const slug = workspace.slug
    revalidatePath(`/w/${slug}/settings`)
    revalidatePath(`/w/${slug}`)
    return { success: true, message: "Imagen eliminada correctamente" }
  } catch (error) {
    console.error("Error eliminando imagen:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando imagen" 
    }
  }
}