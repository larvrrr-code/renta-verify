import { TrendingDown, Lightbulb, Clock, BadgeCheck } from "lucide-react"

const benefits = [
  {
    icon: TrendingDown,
    title: "Reduce el riesgo",
    description: "Minimiza las probabilidades de enfrentar impagos, daños a la propiedad o conflictos legales con inquilinos problemáticos.",
    stat: "85%",
    statLabel: "Reducción de incidentes"
  },
  {
    icon: Lightbulb,
    title: "Mejores decisiones",
    description: "Toma decisiones basadas en datos objetivos, no en intuiciones. Accede a información verificada y actualizada.",
    stat: "3x",
    statLabel: "Más información disponible"
  },
  {
    icon: Clock,
    title: "Ahorra tiempo",
    description: "Automatiza el proceso de verificación que normalmente tomaría días o semanas de investigación manual.",
    stat: "90%",
    statLabel: "Menos tiempo invertido"
  },
  {
    icon: BadgeCheck,
    title: "Tranquilidad total",
    description: "Renta con la confianza de saber exactamente quién habitará tu propiedad. Protege tu inversión y tu paz mental.",
    stat: "100%",
    statLabel: "Satisfacción garantizada"
  }
]

export function Benefits() {
  return (
    <section id="beneficios" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Beneficios
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            ¿Por qué elegir Renta Verify?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Más que un servicio de verificación, somos tu aliado estratégico 
            en la gestión de propiedades.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:border-secondary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-accent">{benefit.stat}</p>
                  <p className="text-xs text-muted-foreground">{benefit.statLabel}</p>
                </div>
              </div>
              
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
