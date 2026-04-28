"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Trash2,
  XCircle,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { createClient } from "@/lib/supabase"
import {
  getCurrentPeriod,
  getLeasePaymentSummary,
} from "@/lib/payment-status"
const supabase = createClient()

import { DashboardHeader } from "@/components/dashboard/header"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Property = {
  id: string
  name: string | null
  address: string | null
  neighborhood: string | null
  user_id: string | null
}

type Lease = {
  id: string
  property_id: string | null
  tenant_id: string | null
  status: string | null
  due_day: number | null
  rent_amount: number | null
  start_date: string | null
  end_date: string | null
  user_id: string | null
  created_at: string | null
}

type Payment = {
  id: string
  lease_id: string | null
  amount: number | null
  payment_date: string | null
  payment_method: string | null
  period_month: number | null
  period_year: number | null
  notes: string | null
  user_id: string | null
}

const paymentMethodLabels: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  deposito: "Depósito",
}

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "—"
  return `$${Number(amount).toLocaleString("es-MX")}`
}

function formatDate(date?: string | null) {
  if (!date) return "—"

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getMonthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleDateString("es-MX", {
    month: "long",
  })
}

function getDueDate(year: number, month: number, dueDay?: number | null) {
  const lastDay = new Date(year, month, 0).getDate()
  const safeDay = Math.min(dueDay || 1, lastDay)

  return new Date(year, month - 1, safeDay)
}

export default function PaymentsPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id ?? null)
    }

    loadUser()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage("")

      const [
        { data: propertiesData, error: propertiesError },
        { data: leasesData, error: leasesError },
        { data: paymentsData, error: paymentsError },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("id, name, address, neighborhood, user_id")
          .eq("user_id", currentUserId),

        supabase
          .from("leases")
          .select(
            "id, property_id, tenant_id, status, due_day, rent_amount, start_date, end_date, user_id, created_at"
          )
          .eq("user_id", currentUserId),

        supabase
          .from("payments")
          .select(
            "id, lease_id, amount, payment_date, payment_method, period_month, period_year, notes, user_id"
          )
          .eq("user_id", currentUserId)
          .order("payment_date", { ascending: false }),
      ])

      if (propertiesError) {
        setErrorMessage(propertiesError.message)
        setLoading(false)
        return
      }

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

      setProperties(propertiesData ?? [])
      setLeases(leasesData ?? [])
      setPayments(paymentsData ?? [])
      setLoading(false)
    }

    fetchData()
  }, [currentUserId])

  const propertyById = useMemo(() => {
    const map = new Map<string, Property>()

    properties.forEach((property) => {
      map.set(property.id, property)
    })

    return map
  }, [properties])

  const leaseById = useMemo(() => {
    const map = new Map<string, Lease>()

    leases.forEach((lease) => {
      map.set(lease.id, lease)
    })

    return map
  }, [leases])

  const activeLeases = useMemo(() => {
    return leases.filter((lease) => lease.status === "active")
  }, [leases])

  const enrichedPayments = useMemo(() => {
    return payments.map((payment) => {
      const lease = payment.lease_id ? leaseById.get(payment.lease_id) : null
      const property = lease?.property_id
        ? propertyById.get(lease.property_id)
        : null

      return {
        ...payment,
        lease,
        property,
      }
    })
  }, [payments, leaseById, propertyById])

  const currentMonthStatus = useMemo(() => {
    const period = getCurrentPeriod()
    const { today, month: currentMonth, year: currentYear } = period

    const upcoming: {
      id: string
      propertyName: string
      propertyAddress: string
      amount: number | null
      dueDate: Date
      dueDay: number | null
    }[] = []

    const overdue: {
      id: string
      propertyName: string
      propertyAddress: string
      amount: number | null
      dueDate: Date
      dueDay: number | null
    }[] = []

    let receivedCount = 0

    activeLeases.forEach((lease) => {
      const property = lease.property_id
        ? propertyById.get(lease.property_id)
        : null

      const summary = getLeasePaymentSummary(lease, payments, period)

      if (summary.status === "pagado") {
        receivedCount += 1
        return
      }

      const dueDate = getDueDate(currentYear, currentMonth, lease.due_day)

      const row = {
        id: lease.id,
        propertyName: property?.name || "Propiedad sin nombre",
        propertyAddress: property?.address || "Sin dirección",
        amount: summary.remainingCurrentMonth || lease.rent_amount,
        dueDate,
        dueDay: lease.due_day,
      }

      if (summary.status === "atrasado") {
        overdue.push(row)
      } else {
        upcoming.push(row)
      }
    })

    return { upcoming, overdue, receivedCount }
  }, [activeLeases, payments, propertyById])

  const monthlyChartData = useMemo(() => {
    const today = new Date()

    return Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const total = payments
        .filter(
          (payment) =>
            payment.period_month === month && payment.period_year === year
        )
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

      return {
        month: date.toLocaleDateString("es-MX", { month: "short" }),
        ingresos: total,
      }
    })
  }, [payments])

  const pieChartData = useMemo(() => {
    return [
      {
        name: "Recibidos",
        value: currentMonthStatus.receivedCount,
        color: "#16a34a",
      },
      {
        name: "Próximos",
        value: currentMonthStatus.upcoming.length,
        color: "#eab308",
      },
      {
        name: "No recibidos",
        value: currentMonthStatus.overdue.length,
        color: "#dc2626",
      },
    ]
  }, [currentMonthStatus])

  const totalReceived = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  )

  const totalUpcoming = currentMonthStatus.upcoming.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  const totalOverdue = currentMonthStatus.overdue.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  return (
    <>
      <DashboardHeader
        title="Pagos"
        description="Consulta pagos recibidos, próximos pagos y pagos no recibidos."
      />

      <main className="w-full max-w-none space-y-6 px-6 pt-6 pb-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando pagos...</p>
        ) : errorMessage ? (
          <p className="text-sm text-red-600">Error: {errorMessage}</p>
        ) : (
          <>
            <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
              <MetricCard
                title="Pagos recibidos"
                value={formatCurrency(totalReceived)}
                description={`${payments.length} pagos registrados`}
                icon={<CheckCircle2 className="h-6 w-6 text-green-700" />}
                iconBoxClassName="bg-green-100"
                badgeLabel="Recibidos"
              />

              <MetricCard
                title="Próximos a recibirse"
                value={formatCurrency(totalUpcoming)}
                description={`${currentMonthStatus.upcoming.length} pagos pendientes del mes`}
                icon={<CalendarClock className="h-6 w-6 text-yellow-700" />}
                iconBoxColor="#fef3c7"
                badgeLabel="Próximos"
              />

              <MetricCard
                title="Pagos no recibidos"
                value={formatCurrency(totalOverdue)}
                description={`${currentMonthStatus.overdue.length} pagos atrasados`}
                icon={<XCircle className="h-6 w-6 text-red-700" />}
                iconBoxClassName="bg-red-100"
                badgeLabel="Atrasados"
              />
            </section>

            <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Ingresos recibidos
                  </CardTitle>
                  <CardDescription className="text-base">
                    Evolución de pagos registrados durante los últimos 6 meses.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <MiniLineChart data={monthlyChartData} />
                </CardContent>
              </Card>

              <Card className="flex min-w-0 flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CircleDollarSign className="h-6 w-6 text-green-600" />
                    Estatus del mes
                  </CardTitle>
                  <CardDescription className="text-base">
                    Distribución de pagos recibidos, próximos y atrasados.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 items-center pt-2">
                  <MiniDonutChart data={pieChartData} />
                </CardContent>
              </Card>
            </section>

            <PaymentsReceivedTable
              payments={enrichedPayments}
              onDelete={async (paymentId) => {
                const { error } = await supabase
                  .from("payments")
                  .delete()
                  .eq("id", paymentId)

                if (error) {
                  setErrorMessage(error.message)
                  return
                }

                setPayments((prev) =>
                  prev.filter((payment) => payment.id !== paymentId)
                )
              }}
            />

            <ExpectedPaymentsTable
              title="Pagos próximos a recibirse"
              description="Rentas del mes actual que aún no vencen."
              rows={currentMonthStatus.upcoming}
              badgeClassName="border-yellow-200 bg-yellow-50 text-yellow-700"
              badgeLabel="Próximo"
            />

            <ExpectedPaymentsTable
              title="Pagos no recibidos"
              description="Rentas del mes actual que ya vencieron y no tienen pago registrado."
              rows={currentMonthStatus.overdue}
              badgeClassName="border-red-200 bg-red-50 text-red-700"
              badgeLabel="Atrasado"
            />
          </>
        )}
      </main>
    </>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon,
  iconBoxClassName,
  iconBoxColor,
  badgeLabel,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  iconBoxClassName?: string
  iconBoxColor?: string
  badgeLabel: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBoxClassName || ""}`}
          style={iconBoxColor ? { backgroundColor: iconBoxColor } : undefined}
        >
          {icon}
        </div>

        <span className="rounded-md border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          {badgeLabel}
        </span>
      </div>

      <div className="mt-4">
        <div className="text-4xl font-bold leading-none text-slate-950">
          {value}
        </div>

        <p className="mt-3 text-base font-medium text-slate-700">{title}</p>

        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function MiniLineChart({
  data,
}: {
  data: {
    month: string
    ingresos: number
  }[]
}) {
  const width = 600
  const height = 260
  const paddingLeft = 70
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 35

  const rawMax = Math.max(...data.map((d) => d.ingresos), 1)
  const maxValue = Math.max(100000, Math.ceil(rawMax / 25000) * 25000)

  const chartW = width - paddingLeft - paddingRight
  const chartH = height - paddingTop - paddingBottom

  const points = data.map((item, i) => ({
    ...item,
    x: paddingLeft + (i * chartW) / Math.max(data.length - 1, 1),
    y: height - paddingBottom - (item.ingresos / maxValue) * chartH,
  }))

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  const gridSteps = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-[260px] w-full"
    >
      {gridSteps.map((step) => {
        const y = height - paddingBottom - step * chartH
        return (
          <g key={step}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={step === 0 ? "0" : "4 4"}
            />
            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500 text-[12px]"
            >
              {`$${Math.round(maxValue * step).toLocaleString("es-MX")}`}
            </text>
          </g>
        )
      })}

      <path
        d={path}
        fill="none"
        stroke="#082866"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p) => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r="5" fill="#082866" stroke="white" strokeWidth="2" />
          <text
            x={p.x}
            y={height - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[12px] capitalize"
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  )
}

function MiniDonutChart({
  data,
}: {
  data: {
    name: string
    value: number
    color: string
  }[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-muted-foreground">
        Aún no hay datos suficientes para mostrar esta gráfica.
      </div>
    )
  }

  const size = 240
  const radius = 95
  const strokeWidth = 28
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <div className="flex w-full min-w-0 items-center gap-8">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {data.map((item) => {
            const pct = item.value / total
            const dash = `${pct * circumference} ${circumference}`
            const offset = -cumulative * circumference
            cumulative += pct
            return (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold leading-none text-slate-950">{total}</p>
          <p className="mt-1 text-xs text-slate-600">pagos</p>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        {data.map((item) => {
          const percentage = Math.round((item.value / total) * 100)
          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                    width: 12,
                    height: 12,
                    display: "inline-block",
                  }}
                />
                <span className="truncate text-sm font-medium text-slate-700">
                  {item.name} ({item.value})
                </span>
              </div>
              <span className="shrink-0 text-sm font-medium text-slate-500">
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaymentsReceivedTable({
  payments,
  onDelete,
}: {
  payments: (Payment & {
    lease?: Lease | null
    property?: Property | null
  })[]
  onDelete: (paymentId: string) => void | Promise<void>
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-green-700">Pagos recibidos</CardTitle>
        <CardDescription>
          Historial de pagos registrados en la plataforma.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay pagos registrados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Propiedad</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Fecha de pago</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="pr-0 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-0">
                    <div className="font-medium">
                      {payment.property?.name || "Propiedad sin nombre"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.property?.address || "Sin dirección"}
                    </div>
                  </TableCell>

                  <TableCell className="capitalize">
                    {payment.period_month && payment.period_year
                      ? `${getMonthName(payment.period_month)} ${payment.period_year}`
                      : "—"}
                  </TableCell>

                  <TableCell>{formatDate(payment.payment_date)}</TableCell>

                  <TableCell>
                    {payment.payment_method
                      ? paymentMethodLabels[payment.payment_method] ||
                        payment.payment_method
                      : "—"}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>

                  <TableCell className="max-w-[260px] truncate text-muted-foreground">
                    {payment.notes || "—"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      Recibido
                    </Badge>
                  </TableCell>

                  <TableCell className="pr-0 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          aria-label="Eliminar pago"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este pago?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El pago de{" "}
                            {formatCurrency(payment.amount)} registrado el{" "}
                            {formatDate(payment.payment_date)} será eliminado
                            permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(payment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function ExpectedPaymentsTable({
  title,
  description,
  rows,
  badgeClassName,
  badgeLabel,
}: {
  title: string
  description: string
  rows: {
    id: string
    propertyName: string
    propertyAddress: string
    amount: number | null
    dueDate: Date
    dueDay: number | null
  }[]
  badgeClassName: string
  badgeLabel: string
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay registros en esta categoría.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Propiedad</TableHead>
                <TableHead>Fecha esperada</TableHead>
                <TableHead>Día de pago</TableHead>
                <TableHead>Monto esperado</TableHead>
                <TableHead className="pr-0">Estatus</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-0">
                    <div className="font-medium">{row.propertyName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.propertyAddress}
                    </div>
                  </TableCell>

                  <TableCell>
                    {row.dueDate.toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell>{row.dueDay || "—"}</TableCell>

                  <TableCell className="font-medium">
                    {formatCurrency(row.amount)}
                  </TableCell>

                  <TableCell className="pr-0">
                    <Badge variant="outline" className={badgeClassName}>
                      {badgeLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}