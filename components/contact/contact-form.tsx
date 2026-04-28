"use client"

import { useEffect, useState } from "react"
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const supabase = createClient()

const CONTACT_EMAIL = "contacto@rentaverify.com"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const firstName = user.user_metadata?.first_name || ""
      const lastName = user.user_metadata?.last_name || ""
      const fullName = `${firstName} ${lastName}`.trim()

      if (fullName) setName(fullName)
      if (user.email) setEmail(user.email)
    }

    loadUser()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Por favor completa todos los campos.")
      return
    }

    setSubmitting(true)
    setError("")

    const subject = encodeURIComponent(`Soporte Renta Verify - ${name}`)
    const body = encodeURIComponent(
      `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`
    )

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`

    setTimeout(() => {
      setSubmitted(true)
      setSubmitting(false)
    }, 500)
  }

  const handleNewMessage = () => {
    setMessage("")
    setSubmitted(false)
    setError("")
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card style={{ border: "1.5px solid #94a3b8" }}>
        <CardContent className="p-6 sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#E8EEF9" }}
              >
                <CheckCircle2 className="h-7 w-7 text-[#3E61D0]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-wider text-foreground">
                  Â¡Gracias por comunicarte con nosotros!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recibimos tu mensaje y nos comunicaremos en breve para
                  asistirte con lo que necesites.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleNewMessage}
                className="transition-colors hover:bg-muted"
              >
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#E8EEF9" }}
                >
                  <MessageSquare className="h-6 w-6 text-[#3E61D0]" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wider text-foreground">
                    Enví­anos un mensaje
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Te responderemos lo más pronto posible.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" required>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass()}
                    placeholder="Tu nombre"
                    required
                  />
                </Field>

                <Field label="Correo" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass()}
                    placeholder="tu@correo.com"
                    required
                  />
                </Field>
              </div>

              <Field label="Mensaje" required>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass()} min-h-[140px] resize-none`}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  required
                />
              </Field>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
              >
                <Mail className="mr-2 h-4 w-4" />
                {submitting ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#213A6B] focus:ring-2 focus:ring-[#213A6B]/15"
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      {children}
    </div>
  )
}
