import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Workspace, WorkspaceRole } from "@prisma/client"
import { Users, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

interface WorkspaceCardProps {
  workspace: Workspace
  userRole: WorkspaceRole
  isSuperadmin?: boolean
}

export function WorkspaceCard({ workspace, userRole, isSuperadmin = false }: WorkspaceCardProps) {
  const getRoleBadge = (role: WorkspaceRole, isSuperadmin: boolean) => {
    if (isSuperadmin) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100">
          <Shield className="w-3 h-3 mr-1" />
          Superadmin
        </Badge>
      )
    }
    
    return role === WorkspaceRole.admin ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        Miembro
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 mt-0.5">
              <AvatarImage src={workspace.image || undefined} alt={workspace.name} />
              <AvatarFallback className="text-xs">
                {workspace.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight">{workspace.name}</CardTitle>
              <p className="text-sm text-muted-foreground">/{workspace.slug}</p>
            </div>
          </div>
          {getRoleBadge(userRole, isSuperadmin)}
        </div>
      </CardHeader>
      
      <CardContent className="py-3">
        <p className="text-sm text-muted-foreground">
          {workspace.description || "Workspace por defecto del sistema"}
        </p>
      </CardContent>
      
      <CardFooter className="pt-3">
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Workspace</span>
          </div>
          <Button asChild className="w-full" size="sm">
            <Link href={`/w/${workspace.slug}`}>
              Acceder
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}