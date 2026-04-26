"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase"

const supabase = createClient()

function PasswordInput({
  value,
  onChange,
  show,
  setShow,
  placeholder = "••••••••",
}: {
  value: string
  onChange: (value: string) => void
  show: boolean
  setShow: (value: boolean) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#3E61D0] focus:ring-2 focus:ring-[#3E61D0]/20"
        required
        minLength={6}
      />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#213A6B]"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}

export default function ActualizarPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setErrorMessage(
        "La contraseña es muy similar a la anterior, por favor intenta con otra"
      )
      setIsLoading(false)
      return
    }

    setSuccessMessage("Tu contraseña fue actualizada correctamente.")
    setPassword("")
    setConfirmPassword("")
    setIsLoading(false)

    setTimeout(() => {
      router.push("/login")
    }, 1800)
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#E7EEF9" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="px-8 py-12 md:px-9 md:py-14">
          <div className="mb-8">
            <img
              src="/RentaVerify_imagotipo_horizontal_color.png"
              alt="Renta Verify"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-wider text-foreground">
              Actualizar contraseña
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword}>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Nueva contraseña
                </label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Confirmar nueva contraseña
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-700">{successMessage}</p>
              )}
            </div>

            <div className="mt-10 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-lg text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: "#D5702A" }}
              >
                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="h-12 w-full rounded-lg border text-sm font-medium transition-colors"
                style={{
                  borderColor: "#213A6B",
                  color: "#213A6B",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}