"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  HelpCircle,
  LogOut,
  ChevronDown,
  CircleDollarSign,
  Menu,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Propiedades", href: "/propiedades", icon: Building2 },
  { name: "Pagos", href: "/pagos", icon: CircleDollarSign },
  { name: "Inquilinos", href: "/inquilinos", icon: Users },
]

const secondaryNavigation = [
  { name: "Ayuda", href: "/contacto", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [initials, setInitials] = useState("")
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

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
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menú"
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#213A6B] shadow-md transition-colors hover:bg-slate-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen ? (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      ) : null}

    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#213A6B] text-white transition-transform duration-200 md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="relative flex h-20 items-center border-b border-white/10 px-6">
        <img
          src="/RentaVerify_imagotipo_horizontal_blanco.png"
          alt="Renta Verify"
          className="h-8 object-contain"
        />
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#3E61D0] text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="pt-6">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-white/50">
            Soporte
          </p>

          <div className="mt-2 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#3E61D0] text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatars/user.jpg" alt="Usuario" />
                <AvatarFallback className="bg-white/20 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-white">
                  {fullName || "Usuario"}
                </p>
                <p className="text-xs text-white/60">Propietario</p>
              </div>

              <ChevronDown className="h-4 w-4 text-white/60" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
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
    </aside>
    </>
  )
}