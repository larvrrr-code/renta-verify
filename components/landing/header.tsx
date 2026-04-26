"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <img
            src="/RentaVerify_imagotipo_horizontal_color.png"
            alt="Renta Verify"
            className="h-10 w-auto"
          />

          <div className="hidden lg:flex items-center gap-8">
            <a href="#problema" className="text-sm text-muted-foreground hover:text-foreground">El Problema</a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground">Cómo Funciona</a>
            <a href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground">Características</a>
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground">Beneficios</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Iniciar sesión
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Comenzar evaluación
            </Button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border space-y-4">
            <a href="#problema" className="block text-sm">El Problema</a>
            <a href="#como-funciona" className="block text-sm">Cómo Funciona</a>
            <a href="#caracteristicas" className="block text-sm">Características</a>
            <a href="#beneficios" className="block text-sm">Beneficios</a>

            <div className="pt-4 border-t space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/login")}
              >
                Iniciar sesión
              </Button>

              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Comenzar evaluación
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}