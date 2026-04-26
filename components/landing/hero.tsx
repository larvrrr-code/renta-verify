import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, BarChart3, Search } from "lucide-react"

export function Hero() {
  return (
    <section className="relative isolate pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(circle at top, rgba(62, 97, 208, 0.12), transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-5 py-2.5 text-base font-medium text-secondary">
            <Shield className="w-4 h-4" />
            <span>Evaluación profesional de inquilinos</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.1] lg:leading-[1.05] tracking-tight text-foreground text-balance">
            Decide con información.{" "}
            <br />
            <span className="text-[#3E61D0]">Renta con seguridad.</span>
          </h1>
          
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl text-pretty">
            Evalúa a tus inquilinos con datos reales: análisis crediticio, antecedentes legales 
            y presencia digital. Toma decisiones informadas y protege tu inversión inmobiliaria.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold px-8 h-12 w-full sm:w-auto"
            >
              Comenzar evaluación
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <a href="#como-funciona">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base font-medium px-8 h-12 w-full sm:w-auto border-border hover:bg-muted"
            >
              Conocer el proceso
            </Button>
          </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              Precisión
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Evaluaciones confiables
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-4">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              Seguridad
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Protege tu inversión
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              24hrs
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tiempo promedio de reporte
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}