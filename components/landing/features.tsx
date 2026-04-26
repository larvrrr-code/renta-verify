import { CreditCard, Scale, Globe, CheckCircle } from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Análisis crediticio",
    description: "Evaluamos el historial crediticio del candidato, incluyendo deudas activas, pagos atrasados y comportamiento financiero general.",
    highlights: ["Score crediticio actualizado", "Historial de pagos", "Deudas pendientes", "Comportamiento financiero"]
  },
  {
    icon: Scale,
    title: "Antecedentes penales",
    description: "Verificamos registros legales y antecedentes penales para asegurar que tu propiedad esté en manos confiables.",
    highlights: ["Registros penales", "Historial de litigios", "Demandas civiles", "Verificación de identidad"]
  },
  {
    icon: Globe,
    title: "Análisis de redes sociales",
    description: "Revisamos la presencia digital del candidato para obtener una visión más completa de su perfil y comportamiento.",
    highlights: ["Perfil profesional", "Reputación digital", "Consistencia de datos", "Señales de alerta"]
  }
]

export function Features() {
  return (
    <section id="caracteristicas" className="py-20 lg:py-32 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/70">
            Características
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Evaluación integral de tus candidatos
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 text-pretty">
            Combinamos múltiples fuentes de información para brindarte un análisis 
            completo y confiable de cada potencial inquilino.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-8 transition-all hover:bg-primary-foreground/10"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mb-6">
                <feature.icon className="w-7 h-7 text-secondary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="mt-3 text-primary-foreground/70 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="mt-6 space-y-3">
                {feature.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-primary-foreground/80">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
