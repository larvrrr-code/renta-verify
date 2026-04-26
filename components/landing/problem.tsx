import { AlertTriangle, XCircle, Clock, DollarSign } from "lucide-react"

const problems = [
  {
    icon: DollarSign,
    title: "Rentas impagadas",
    description:
      "Inquilinos que dejan de pagar sin previo aviso, generando pérdidas económicas significativas y procesos legales costosos.",
  },
  {
    icon: AlertTriangle,
    title: "Conflictos legales",
    description:
      "Antecedentes penales o historial de litigios que pueden convertirse en problemas serios para tu propiedad y seguridad.",
  },
  {
    icon: XCircle,
    title: "Inquilinos poco confiables",
    description:
      "Información falsa en solicitudes, referencias inventadas y comportamientos que ponen en riesgo tu inversión.",
  },
  {
    icon: Clock,
    title: "Procesos de desalojo",
    description:
      "Meses de trámites legales, gastos de abogados y propiedades deterioradas por inquilinos problemáticos.",
  },
]

export function Problem() {
  return (
    <section id="problema" className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-[13px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "#3E61D0" }}
          >
            El problema
          </p>

          <h2
            className="mt-3 text-3xl font-semibold tracking-[0.02em] leading-tight sm:text-4xl text-balance"
            style={{ color: "#213A6B" }}
          >
            Rentar sin información es un riesgo que no puedes permitirte
          </h2>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
            Cada año, miles de propietarios enfrentan pérdidas significativas por
            no evaluar adecuadamente a sus inquilinos antes de firmar un
            contrato.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="relative group rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-secondary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold tracking-[0.01em]"
                    style={{ color: "#213A6B" }}
                  >
                    {problem.title}
                  </h3>

                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}