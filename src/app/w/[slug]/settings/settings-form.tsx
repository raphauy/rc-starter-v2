import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { notFound, redirect } from "next/navigation"
import { SettingsClient } from "./settings-client"

interface SettingsFormProps {
  slug: string
}

export async function SettingsForm({ slug }: SettingsFormProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)

  if (!isAdmin) {
    redirect(`/w/${slug}`)
  }

  return <SettingsClient workspace={workspace} />
}