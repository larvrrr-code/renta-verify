"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [initials, setInitials] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const firstName = user.user_metadata?.first_name || ""
      const lastName = user.user_metadata?.last_name || ""

      const name = `${firstName} ${lastName}`.trim()
      setFullName(name || "Usuario")

      const firstInitial = firstName.charAt(0) || ""
      const lastInitial = lastName.charAt(0) || ""

      setInitials((firstInitial + lastInitial).toUpperCase() || "U")
    }

    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="dashboard-header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-wider">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.jpg" alt="Usuario" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <span className="hidden font-medium md:inline-block">
                {fullName || "Usuario"}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}