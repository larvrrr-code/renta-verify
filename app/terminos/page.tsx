import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16 lg:pt-20">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-wider text-[#213A6B] sm:text-4xl">
              Términos y Condiciones Simplificados
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Renta Verify
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-4xl space-y-5 px-6 py-10 text-sm leading-relaxed text-foreground sm:text-base lg:px-8">
          <p>
            El acceso, registro y uso de la Plataforma Renta Verify implica la
            aceptación de los presentes Términos y Condiciones, así como de su
            versión completa disponible para consulta.
          </p>

          <p>
            Renta Verify es una herramienta digital que permite al Usuario
            registrar, organizar y consultar información relacionada con la
            administración de propiedades en arrendamiento. Su función es
            exclusivamente tecnológica y organizativa.
          </p>

          <p>
            La Plataforma no valida información, no verifica identidad, no
            evalúa comportamiento, no genera perfiles ni emite recomendaciones
            legales, financieras o inmobiliarias. Tampoco garantiza el
            cumplimiento de obligaciones entre particulares.
          </p>

          <p>
            Toda la información registrada en la Plataforma es proporcionada
            directamente por el Usuario, quien es el único responsable de su
            contenido, uso y consecuencias. El Responsable no interviene en la
            generación, validación o interpretación de dicha información.
          </p>

          <p>
            El Usuario se obliga a utilizar la Plataforma de forma lícita y
            conforme a estos Términos, absteniéndose de registrar información
            sensible, confidencial o que permita la identificación plena de
            personas, así como de utilizar la Plataforma para fines indebidos o
            contrarios a su naturaleza.
          </p>

          <p>
            La Plataforma se encuentra en fase de desarrollo, por lo que puede
            presentar fallas, interrupciones, cambios o pérdida de información.
            El Usuario acepta que el uso del sistema se realiza bajo su propio
            riesgo.
          </p>

          <p>
            El Responsable no será responsable por decisiones tomadas por el
            Usuario, por conflictos con terceros, por pérdida de información ni
            por interrupciones del servicio, en la máxima medida permitida por
            la legislación aplicable.
          </p>

          <p>
            La información registrada podrá ser utilizada de forma agregada y
            no identificable con fines estadísticos, analíticos y de mejora del
            servicio, sin que ello implique la identificación individual de
            personas.
          </p>

          <p>
            El uso de la Plataforma no genera relación laboral, comercial o de
            intermediación entre el Usuario y el Responsable.
          </p>

          <p>
            El Responsable podrá modificar, suspender o cancelar el servicio en
            cualquier momento.
          </p>

          <p>
            Para cualquier comunicación, el Usuario podrá contactar a través
            de:{" "}
            <a
              href="mailto:rentaverify@gmail.com"
              className="text-[#3E61D0] underline-offset-4 hover:underline"
            >
              rentaverify@gmail.com
            </a>{" "}
            · Instagram:{" "}
            <a
              href="https://instagram.com/rentaverify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3E61D0] underline-offset-4 hover:underline"
            >
              @rentaverify
            </a>
            .
          </p>

          <p>
            El uso de la Plataforma implica la aceptación de la versión
            completa de los Términos y Condiciones.
          </p>
          <div className="pt-6">
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <a href="/terminos-y-condiciones-extensos.pdf" download>
                Consultar versión extensa en PDF
                <Download className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
