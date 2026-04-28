import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { ContactForm } from "@/components/contact/contact-form"

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16 lg:pt-20">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-wider text-[#213A6B] sm:text-4xl">
              Ayuda y Soporte
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              ¿Tienes alguna duda o necesitas asistencia? Escríbenos y te
              responderemos lo antes posible.
            </p>
          </div>
        </section>

        <div className="px-6 py-10 lg:px-8">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
