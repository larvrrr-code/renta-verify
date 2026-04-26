import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

const ctaPoints = [
  "Sin compromisos a largo plazo",
  "Resultados en menos de 24 horas",
  "Soporte personalizado incluido"
]

export function FinalCTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 sm:px-16 lg:px-24 lg:py-24">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl text-balance">
              Protege tu inversión hoy mismo
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/80 text-pretty">
              Únete a miles de propietarios que ya evalúan a sus inquilinos con Renta Verify. 
              Comienza tu primera evaluación en minutos.
            </p>
            
            <ul className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              {ctaPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold px-8 h-14 w-full sm:w-auto"
              >
                Comenzar evaluación gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base font-medium px-8 h-14 w-full sm:w-auto"
              >
                Hablar con ventas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
