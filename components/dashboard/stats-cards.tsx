"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, CreditCard, AlertCircle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase"
const supabase = createClient()
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Lease = {
  id: string
  property_id: string | null
  status: string | null
  due_day: number | null
}

type Payment = {
  id: string
  lease_id: string | null
  amount: number | null
  payment_date: string | null
  period_month: number | null
  period_year: number | null
}

export function StatsCards() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setErrorMessage("")

    const [
      { data: leasesData, error: leasesError },
      { data: paymentsData, error: paymentsError },
    ] = await Promise.all([
      supabase.from("leases").select("id, property_id, status, due_day"),
      supabase.from("payments").select("id, lease_id, amount, payment_date, period_month, period_year"),
    ])

    if (leasesError) {
      setErrorMessage(leasesError.message)
      setLoading(false)
      return
    }

    if (paymentsError) {
      setErrorMessage(paymentsError.message)
      setLoading(false)
      return
    }

    setLeases(leasesData ?? [])
    setPayments(paymentsData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const currentDay = today.getDate()

    const activeLeases = leases.filter(
      (lease) => lease.status === "active" && lease.property_id
    )

    const totalCollectedThisMonth = payments
      .filter(
        (payment) =>
          payment.period_month === currentMonth &&
          payment.period_year === currentYear
      )
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)

    const hasCurrentMonthPayment = (leaseId: string) =>
      payments.some(
        (payment) =>
          payment.lease_id === leaseId &&
          payment.period_month === currentMonth &&
          payment.period_year === currentYear
      )

    const overdueCount = activeLeases.filter((lease) => {
      if (!lease.due_day) return false
      if (hasCurrentMonthPayment(lease.id)) return false
      return currentDay > lease.due_day
    }).length

    const upcomingCount = activeLeases.filter((lease) => {
      if (!lease.due_day) return false
      if (hasCurrentMonthPayment(lease.id)) return false
      if (currentDay >= lease.due_day) return false
      return lease.due_day - currentDay <= 7
    }).length

    const activePropertiesCount = activeLeases.length

    return {
      totalCollectedThisMonth,
      overdueCount,
      upcomingCount,
      activePropertiesCount,
    }
  }, [leases, payments])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-sm text-red-600">Error: {errorMessage}</p>
        </CardContent>
      </Card>
    )
  }

  const cards = [
    {
      name: "Total cobrado este mes",
      value: `$${stats.totalCollectedThisMonth.toLocaleString("es-MX")}`,
      icon: CreditCard,
      description: "pagos registrados del periodo actual",
      iconClassName: "bg-primary/10 text-primary",
      badge: "Mes actual",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      name: "Pagos vencidos",
      value: String(stats.overdueCount),
      icon: AlertCircle,
      description: "requieren atención",
      iconClassName: "bg-red-100 text-red-500",
      badge: "Pendientes de pago",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      name: "Próximos vencimientos",
      value: String(stats.upcomingCount),
      icon: Calendar,
      description: "a tener en cuenta",
      iconClassName: "bg-primary/10 text-primary",
      badge: "en 7 días",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      name: "Propiedades activas",
      value: String(stats.activePropertiesCount),
      icon: Building2,
      description: "actualmente ocupadas",
      iconClassName: "bg-primary/10 text-primary",
      badge: "Ocupadas",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.name} className="relative overflow-hidden border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  card.iconClassName ?? "bg-primary/10 text-primary"
                }`}
              >
                <card.icon className="h-6 w-6" />
              </div>

              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-medium ${card.badgeClassName}`}
              >
                {card.badge}
              </Badge>
            </div>

            <div className="mt-6">
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}