import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface WorkspaceAvatarProps {
  workspace: {
    name: string
    image?: string | null
  }
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-lg"
}

export function WorkspaceAvatar({ workspace, size = "md", className }: WorkspaceAvatarProps) {
  const initials = workspace.name.slice(0, 2).toUpperCase()
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={workspace.image || undefined} alt={workspace.name} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}