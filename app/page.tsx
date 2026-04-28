import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
// import { Problem } from "@/components/landing/problem"
// import { HowItWorks } from "@/components/landing/how-it-works"
// import { Features } from "@/components/landing/features"
// import { Benefits } from "@/components/landing/benefits"
// import { Trust } from "@/components/landing/trust"
// import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      {/* <Problem /> */}
      {/* <HowItWorks /> */}
      {/* <Features /> */}
      {/* <Benefits /> */}
      {/* <Trust /> */}
      {/* <FinalCTA /> */}
      <Footer />
    </main>
  )
}
