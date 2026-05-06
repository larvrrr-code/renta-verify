"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"

const supabase = createClient()

type AuthMode = "login" | "signup"
type SignupStep = 1 | 2 | 3
type OwnerType = "particular" | "inmobiliaria" | "administrador" | ""

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

export default function LoginPage() {
  const router = useRouter()

  const [mode, setMode] = useState<AuthMode>("login")
  const [signupStep, setSignupStep] = useState<SignupStep>(1)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [ownerType, setOwnerType] = useState<OwnerType>("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showRecoverPassword, setShowRecoverPassword] = useState(false)

  const resetMessages = () => {
    setErrorMessage("")
    setSuccessMessage("")
    setShowRecoverPassword(false)
  }

  const switchToLogin = () => {
    setMode("login")
    setSignupStep(1)
    setPassword("")
    setConfirmPassword("")
    setAcceptedTerms(false)
    setAcceptedPrivacy(false)
    resetMessages()
  }

  const switchToSignup = () => {
    setMode("signup")
    setSignupStep(1)
    setPassword("")
    setConfirmPassword("")
    setAcceptedTerms(false)
    setAcceptedPrivacy(false)
    resetMessages()
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    setShowRecoverPassword(false)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrorMessage("Correo o contraseña incorrectos.")
      setShowRecoverPassword(true)
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleRecoverPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Escribe tu correo electrónico para recuperar tu contraseña.")
      return
    }

    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-password`,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    setSuccessMessage("Te enviamos un correo para recuperar tu contraseña.")
    setIsLoading(false)
  }

  const handleSignupStepOne = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !ownerType) {
      setErrorMessage("Completa todos los campos para continuar.")
      return
    }

    setSignupStep(2)
  }

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")

    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage(
        "Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para continuar."
      )
      return
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          owner_type: ownerType,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setSignupStep(3)
    setPassword("")
    setConfirmPassword("")
    setAcceptedTerms(false)
    setAcceptedPrivacy(false)
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#E7EEF9" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="px-8 py-12 md:px-9 md:py-14">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E61D0] focus-visible:ring-offset-2"
              aria-label="Volver a la página principal"
            >
              <img
                src="/RentaVerify_imagotipo_horizontal_color.png"
                alt="Renta Verify"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-wider text-foreground">
              {mode === "login"
                ? "Iniciar sesión"
                : signupStep === 3
                ? "Cuenta creada"
                : "Crear cuenta"}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Accede a tu portal de arrendador de Renta Verify"
                : signupStep === 1
                ? "Ingresa tus datos básicos para crear tu cuenta"
                : signupStep === 2
                ? "Define tu contraseña para terminar el registro"
                : "Revisa tu correo electrónico para confirmar tu cuenta"}
            </p>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-lg border border-input px-4 py-3 text-sm outline-none transition focus:border-[#3E61D0] focus:ring-2 focus:ring-[#3E61D0]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Contraseña
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                {successMessage && (
                  <p className="text-sm text-green-700">{successMessage}</p>
                )}

                {showRecoverPassword && (
                  <button
                    type="button"
                    onClick={handleRecoverPassword}
                    disabled={isLoading}
                    className="text-sm font-medium text-[#3E61D0] transition hover:brightness-110 disabled:opacity-70"
                  >
                    Recuperar contraseña
                  </button>
                )}
              </div>

              <div className="mt-10 space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: "#D5702A" }}
                >
                  {isLoading ? "Ingresando..." : "Iniciar sesión"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="h-12 w-full rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: "#213A6B",
                    color: "#213A6B",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && signupStep === 1 && (
            <form onSubmit={handleSignupStepOne}>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-lg border border-input px-4 py-3 text-sm outline-none transition focus:border-[#3E61D0] focus:ring-2 focus:ring-[#3E61D0]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full rounded-lg border border-input px-4 py-3 text-sm outline-none transition focus:border-[#3E61D0] focus:ring-2 focus:ring-[#3E61D0]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-lg border border-input px-4 py-3 text-sm outline-none transition focus:border-[#3E61D0] focus:ring-2 focus:ring-[#3E61D0]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    ¿Qué opción te define mejor?
                  </label>

                  <div className="space-y-3">
                    {[
                      { value: "particular", label: "Propietario particular" },
                      { value: "inmobiliaria", label: "Inmobiliaria" },
                      { value: "administrador", label: "Administrador" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                          ownerType === option.value
                            ? "border-[#3E61D0] bg-[#3E61D0]/5 text-[#213A6B]"
                            : "border-input bg-white text-foreground hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="ownerType"
                          value={option.value}
                          checked={ownerType === option.value}
                          onChange={(e) =>
                            setOwnerType(e.target.value as OwnerType)
                          }
                          className="h-4 w-4 accent-[#3E61D0]"
                          required
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
              </div>

              <div className="mt-10 space-y-4">
                <button
                  type="submit"
                  className="h-12 w-full rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: "#D5702A" }}
                >
                  Continuar
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && signupStep === 2 && (
            <form onSubmit={handleCreateAccount}>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Contraseña
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
                    Confirmar contraseña
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                  <label className="flex items-start gap-3 text-sm text-foreground">
                    <Checkbox
                      checked={acceptedTerms}
                      onCheckedChange={(checked) =>
                        setAcceptedTerms(checked === true)
                      }
                      className="mt-0.5 border-slate-300 data-[state=checked]:border-[#3E61D0] data-[state=checked]:bg-[#3E61D0] focus-visible:ring-[#3E61D0]/30"
                      aria-label="Aceptar Términos y Condiciones"
                    />
                    <span className="leading-6">
                      Acepto los{" "}
                      <Link
                        href="/terminos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#3E61D0] underline-offset-4 transition hover:underline"
                      >
                        Términos y Condiciones
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-foreground">
                    <Checkbox
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) =>
                        setAcceptedPrivacy(checked === true)
                      }
                      className="mt-0.5 border-slate-300 data-[state=checked]:border-[#3E61D0] data-[state=checked]:bg-[#3E61D0] focus-visible:ring-[#3E61D0]/30"
                      aria-label="Aceptar Aviso de Privacidad"
                    />
                    <span className="leading-6">
                      Acepto el{" "}
                      <Link
                        href="/aviso-privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#3E61D0] underline-offset-4 transition hover:underline"
                      >
                        Aviso de Privacidad
                      </Link>
                    </span>
                  </label>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
              </div>

              <div className="mt-10 space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: "#D5702A" }}
                >
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSignupStep(1)
                    setErrorMessage("")
                    setAcceptedTerms(false)
                    setAcceptedPrivacy(false)
                  }}
                  className="h-12 w-full rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: "#213A6B",
                    color: "#213A6B",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Volver
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && signupStep === 3 && (
            <div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                Tu cuenta fue creada. Revisa tu correo electrónico para confirmarla antes de iniciar sesión.
              </div>

              <div className="mt-10 space-y-4">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="h-12 w-full rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: "#D5702A" }}
                >
                  Ir a iniciar sesión
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="font-medium text-[#3E61D0] transition-all"
                >
                  Crear cuenta
                </button>
              </p>
            ) : signupStep !== 3 ? (
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="font-medium text-[#3E61D0] transition-all"
                >
                  Iniciar sesión
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
