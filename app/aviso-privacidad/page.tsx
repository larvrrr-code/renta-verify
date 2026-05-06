import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function AvisoPrivacidadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16 lg:pt-20">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-wider text-[#213A6B] sm:text-4xl">
              Aviso de Privacidad Simplificado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Renta Verify
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-4xl space-y-5 px-6 py-10 text-sm leading-relaxed text-foreground sm:text-base lg:px-8">
          <p>
            El presente Aviso de Privacidad Simplificado tiene por objeto
            informar, de manera clara y accesible, sobre el tratamiento de los
            datos personales recabados a través de la plataforma digital
            denominada Renta Verify (la &ldquo;Plataforma&rdquo;), operada por
            su titular (el &ldquo;Responsable&rdquo;), quien puede ser
            contactado a través del correo electrónico{" "}
            <a
              href="mailto:rentaverify@gmail.com"
              className="text-[#3E61D0] underline-offset-4 hover:underline"
            >
              rentaverify@gmail.com
            </a>{" "}
            o mediante la cuenta de Instagram{" "}
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
            El Responsable recaba y trata datos personales de carácter general
            proporcionados directamente por el Usuario, tales como su dirección
            de correo electrónico, nombre en caso de ser proporcionado, así
            como información técnica derivada del uso de la Plataforma y la
            información que el propio Usuario decide registrar dentro de la
            misma. La Plataforma está diseñada para operar exclusivamente con
            información de carácter general, por lo que no solicita ni requiere
            datos personales sensibles, información financiera, bancaria ni
            documentos oficiales.
          </p>

          <p>
            Los datos personales son utilizados para permitir el registro,
            acceso y uso de la Plataforma, gestionar la cuenta del Usuario,
            facilitar la autenticación mediante correo electrónico, así como
            para atender solicitudes de soporte, enviar comunicaciones
            relacionadas con el funcionamiento del servicio y, en su caso,
            enviar información sobre mejoras o novedades. Asimismo, la
            información podrá ser utilizada de forma agregada, disociada o
            anonimizada con fines estadísticos y de mejora del servicio, sin
            que ello implique la identificación individual de los Usuarios.
          </p>

          <p>
            El Responsable no vende, cede ni comercializa datos personales. No
            obstante, la información podrá ser almacenada o procesada a través
            de proveedores de servicios tecnológicos necesarios para la
            operación de la Plataforma, quienes actúan bajo obligaciones de
            confidencialidad y seguridad. En determinados casos, los datos
            podrán ser comunicados cuando exista una obligación legal o
            requerimiento de autoridad competente.
          </p>

          <p>
            El Usuario reconoce que la información registrada en la Plataforma
            es proporcionada directamente por él, bajo su exclusiva
            responsabilidad, y que el Responsable no verifica ni valida su
            contenido. Asimismo, el Usuario se obliga a no ingresar información
            sensible ni datos que puedan implicar un riesgo para la privacidad
            de terceros.
          </p>

          <p>
            El Usuario tiene derecho a acceder, rectificar, cancelar u oponerse
            al tratamiento de sus datos personales, así como a limitar su uso o
            revocar su consentimiento, mediante solicitud enviada al correo
            electrónico del Responsable. El ejercicio de estos derechos podrá
            implicar, en ciertos casos, la imposibilidad de continuar
            utilizando la Plataforma.
          </p>

          <p>
            El Responsable implementa medidas razonables para proteger la
            información; sin embargo, el Usuario reconoce que ningún sistema es
            completamente seguro, por lo que no se garantiza la ausencia de
            incidentes de seguridad. El Usuario es responsable de resguardar
            sus credenciales de acceso y de utilizar la Plataforma de manera
            adecuada.
          </p>

          <p>
            El Responsable podrá modificar el presente Aviso de Privacidad en
            cualquier momento. La versión vigente estará disponible dentro de
            la Plataforma, y el uso continuo de la misma implicará la
            aceptación de dichos cambios. Las notificaciones podrán realizarse
            a través de medios electrónicos, incluyendo correo electrónico o
            avisos dentro del sistema, y se considerarán válidas desde el
            momento en que sean enviadas o publicadas.
          </p>

          <p>
            La Plataforma no está dirigida a menores de edad, por lo que su uso
            se limita a personas con capacidad legal para otorgar su
            consentimiento. El uso de la Plataforma implica la aceptación del
            presente Aviso de Privacidad.
          </p>

          <p>
            Para cualquier controversia relacionada con el tratamiento de datos
            personales, el Usuario podrá acudir ante las autoridades
            competentes en los Estados Unidos Mexicanos, incluyendo el
            Instituto Nacional de Transparencia, Acceso a la Información y
            Protección de Datos Personales (INAI), sin perjuicio de intentar
            previamente resolver cualquier situación directamente con el
            Responsable.
          </p>
          <div className="pt-6">
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <a href="/aviso-privacidad-extenso.pdf" download>
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
