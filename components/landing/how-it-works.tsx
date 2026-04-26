import { UserPlus, Search, FileText, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Agrega al inquilino",
    description:
      "Ingresa los datos básicos del candidato: nombre, correo electrónico y número de identificación. El proceso toma menos de 2 minutos.",
    iconBg: "#213A6B",
    badgeBg: "#3E61D0",
  },
  {
    number: "02",
    icon: Search,
    title: "Analizamos los datos",
    description:
      "Nuestro sistema realiza una evaluación integral consultando múltiples fuentes de información verificadas y actualizadas.",
    iconBg: "#3E61D0",
    badgeBg: "#D5702A",
  },
  {
    number: "03",
    icon: FileText,
    title: "Recibe tu reporte",
    description:
      "Obtén un informe detallado con puntuación de riesgo, análisis crediticio, antecedentes y recomendaciones claras.",
    iconBg: "#D5702A",
    badgeBg: "#3E61D0",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          
          <p
            className="text-[13px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "#3E61D0" }}
          >
            Cómo funciona
          </p>

          <h2
            className="mt-3 text-3xl font-semibold tracking-[0.02em] leading-tight sm:text-4xl text-balance"
            style={{ color: "#213A6B" }}
          >
            Tres pasos para evaluar a tu inquilino
          </h2>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Un proceso simple, rápido y profesional que te brinda la información
            que necesitas para tomar la mejor decisión.
          </p>
        </div>

        {/* STEPS */}
        <div className="mt-20 relative">
          
          {/* Línea */}
          <div
            className="hidden lg:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 z-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #213A6B 0%, #3E61D0 55%, #D5702A 100%)",
            }}
          />

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                
                {/* ICONO */}
                <div className="relative z-10">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-lg transition-transform duration-300 hover:scale-105"
                    style={{
                      backgroundColor: step.iconBg,
                      boxShadow:
                        index === 2
                          ? "0 12px 30px rgba(213,112,42,0.25)"
                          : "0 12px 30px rgba(33,58,107,0.15)",
                    }}
                  >
                    <step.icon className="w-8 h-8" />
                  </div>

                  {/* BADGE */}
                  <span
                    className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: step.badgeBg }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* TÍTULO */}
                <h3
                  className="mt-7 text-xl font-semibold tracking-[0.01em]"
                  style={{ color: "#213A6B" }}
                >
                  {step.title}
                </h3>

                {/* DESCRIPCIÓN */}
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {/* FLECHA MOBILE */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden mt-8 flex items-center justify-center">
                    <ArrowRight
                      className="w-6 h-6 rotate-90"
                      style={{ color: "#3E61D0" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}