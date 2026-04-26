import { Shield, Lock, Award, Users } from "lucide-react"

const trustPoints = [
  {
    icon: Shield,
    title: "Profesionalismo",
    description: "Equipo de expertos en análisis de riesgo y verificación de antecedentes con años de experiencia en el sector inmobiliario."
  },
  {
    icon: Lock,
    title: "Confidencialidad",
    description: "Tus datos y los de tus candidatos están protegidos con los más altos estándares de seguridad y privacidad."
  },
  {
    icon: Award,
    title: "Confiabilidad",
    description: "Fuentes de información verificadas y procesos auditados que garantizan la exactitud de cada reporte."
  },
  {
    icon: Users,
    title: "Soporte dedicado",
    description: "Equipo de atención al cliente disponible para resolver tus dudas y guiarte en cada paso del proceso."
  }
]

export function Trust() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Confía en nosotros
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Tu tranquilidad es nuestra prioridad
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              En Renta Verify entendemos la importancia de proteger tu inversión. 
              Por eso, nos comprometemos a brindarte un servicio de la más alta calidad, 
              con total transparencia y profesionalismo.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <point.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8 lg:p-12">
              <div className="h-full rounded-2xl bg-card border border-border shadow-2xl p-6 lg:p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Datos protegidos</p>
                      <p className="text-sm text-muted-foreground">Encriptación de extremo a extremo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">ISO 27001</p>
                      <p className="text-sm text-muted-foreground">Certificación de seguridad</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">GDPR Compliant</p>
                      <p className="text-sm text-muted-foreground">Cumplimiento normativo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
