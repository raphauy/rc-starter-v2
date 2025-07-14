"use client"

import { useState, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Workspace, WorkspaceUser } from "@prisma/client"

interface WorkspaceSelectorProps {
  userWorkspaces: (WorkspaceUser & { workspace: Workspace })[]
}

export function WorkspaceSelector({ userWorkspaces }: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  // Detectar workspace actual desde la URL
  const currentWorkspace = useMemo(() => {
    const workspaceSlugMatch = pathname.match(/^\/w\/([^\/]+)/)
    // Excluir rutas especiales
    if (workspaceSlugMatch && workspaceSlugMatch[1] !== "profile" && workspaceSlugMatch[1] !== "settings") {
      const slug = workspaceSlugMatch[1]
      return userWorkspaces.find(item => item.workspace.slug === slug)?.workspace
    }
    return null
  }, [pathname, userWorkspaces])

  // Filtrar workspaces basados en búsqueda
  const filteredWorkspaces = useMemo(() => {
    if (!search) return userWorkspaces
    const searchLower = search.toLowerCase()
    return userWorkspaces.filter(item => 
      item.workspace.name.toLowerCase().includes(searchLower) ||
      item.workspace.slug.toLowerCase().includes(searchLower)
    )
  }, [search, userWorkspaces])

  const handleWorkspaceSelect = (workspaceSlug: string) => {
    setOpen(false)
    setSearch("")
    router.push(`/w/${workspaceSlug}`)
  }

  // Si no hay workspace actual, mostrar "Seleccionar workspace"
  const triggerLabel = currentWorkspace ? currentWorkspace.name : "Seleccionar workspace"

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar workspace"
          className={cn(
            "h-9 px-3 text-left font-normal",
            !currentWorkspace && "text-muted-foreground"
          )}
        >
          {currentWorkspace && (
            <WorkspaceAvatar workspace={currentWorkspace} size="sm" className="mr-2" />
          )}
          <span className="truncate max-w-[150px]">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px] p-0">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        
        <DropdownMenuSeparator className="mx-2" />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">
          Mis Workspaces
        </DropdownMenuLabel>
        
        <div className="max-h-[300px] overflow-y-auto">
          {filteredWorkspaces.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron workspaces
            </div>
          ) : (
            filteredWorkspaces.map((item) => (
              <DropdownMenuItem
                key={item.workspace.id}
                onClick={() => handleWorkspaceSelect(item.workspace.slug)}
                className="px-2 py-2 cursor-pointer"
              >
                <WorkspaceAvatar workspace={item.workspace} size="sm" className="mr-2" />
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{item.workspace.name}</div>
                  <div className="text-xs text-muted-foreground">/{item.workspace.slug}</div>
                </div>
                {currentWorkspace?.id === item.workspace.id && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/w" className="px-2 py-2 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span>Todos los workspaces</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}