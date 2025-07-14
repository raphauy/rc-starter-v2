import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorkspaceById } from "@/services/workspace-service"
import { WorkspaceSettingsForm } from "./settings-form"

export default async function WorkspaceSettingsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/login")
  }

  const { id } = await params
  const workspace = await getWorkspaceById(id)

  if (!workspace) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuración</h3>
        <p className="text-sm text-muted-foreground">
          Administra la configuración del workspace
        </p>
      </div>

      <WorkspaceSettingsForm workspace={workspace} />
    </div>
  )
}