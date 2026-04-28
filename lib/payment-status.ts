export type PaymentStatus =
  | "sin_contrato"
  | "pagado"
  | "parcial"
  | "pendiente"
  | "pendiente_pago"
  | "proximo_pago"
  | "atrasado"

export const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  sin_contrato: {
    label: "Sin contrato",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
  pagado: {
    label: "Pagado",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  parcial: {
    label: "Pago parcial",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  pendiente: {
    label: "Pendiente",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  pendiente_pago: {
    label: "Pendiente de pago",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  proximo_pago: {
    label: "Próximo de pago",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  atrasado: {
    label: "Atrasado",
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

export type LeaseLike = {
  id: string
  rent_amount: number | null
  due_day: number | null
  start_date: string | null
  status?: string | null
  tenant_id?: string | null
  created_at?: string | null
}

export type PaymentLike = {
  lease_id: string | null
  amount: number | null
  period_month: number | null
  period_year: number | null
  payment_date?: string | null
}

export interface CurrentPeriod {
  today: Date
  month: number
  year: number
  day: number
}

export function getCurrentPeriod(now: Date = new Date()): CurrentPeriod {
  return {
    today: now,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    day: now.getDate(),
  }
}

export function getTodayDateForInput(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function isBeforeToday(dateStr: string, now: Date = new Date()): boolean {
  return dateStr < getTodayDateForInput(now)
}

export const PAST_DATE_PAYMENT_MESSAGE =
  "Por ahora, los pagos deben registrarse con fecha de hoy. Si recibiste un pago en días anteriores, regístralo con la fecha actual."

function clampDueDay(year: number, month: number, dueDay: number | null): number {
  const lastDay = new Date(year, month, 0).getDate()
  return Math.min(Math.max(dueDay || 1, 1), lastDay)
}

export interface LeasePaymentSummary {
  status: PaymentStatus
  rentAmount: number
  paidCurrentMonth: number
  remainingCurrentMonth: number
  totalPaidLifetime: number
  balanceCurrentMonth: number
  balanceLabel: "Saldo a favor" | "Adeudo" | "Sin adeudo"
  balanceAmount: number
  paidMonths: number
  paidUntilLabel: string
  dueDate: Date | null
  nextDueDate: Date | null
}

export function getLeasePaymentSummary(
  lease: LeaseLike | null | undefined,
  payments: PaymentLike[],
  period: CurrentPeriod = getCurrentPeriod()
): LeasePaymentSummary {
  const rentAmount = Number(lease?.rent_amount || 0)
  const leasePayments = lease
    ? payments.filter((p) => p.lease_id === lease.id)
    : []
  const totalPaidLifetime = leasePayments.reduce(
    (s, p) => s + Number(p.amount || 0),
    0
  )

  const empty: LeasePaymentSummary = {
    status: "sin_contrato",
    rentAmount,
    paidCurrentMonth: 0,
    remainingCurrentMonth: 0,
    totalPaidLifetime,
    balanceCurrentMonth: 0,
    balanceLabel: "Sin adeudo",
    balanceAmount: 0,
    paidMonths: 0,
    paidUntilLabel: "Sin contrato",
    dueDate: null,
    nextDueDate: null,
  }

  if (
    !lease ||
    !lease.tenant_id ||
    !lease.start_date ||
    !rentAmount ||
    (lease.status && lease.status !== "active")
  ) {
    return empty
  }

  const paidCurrentMonth = leasePayments
    .filter(
      (p) =>
        p.period_month === period.month && p.period_year === period.year
    )
    .reduce((s, p) => s + Number(p.amount || 0), 0)

  const remainingCurrentMonth = Math.max(rentAmount - paidCurrentMonth, 0)
  const balanceCurrentMonth = paidCurrentMonth - rentAmount

  let balanceLabel: LeasePaymentSummary["balanceLabel"]
  let balanceAmount: number
  if (balanceCurrentMonth > 0) {
    balanceLabel = "Saldo a favor"
    balanceAmount = balanceCurrentMonth
  } else if (balanceCurrentMonth < 0) {
    balanceLabel = "Adeudo"
    balanceAmount = Math.abs(balanceCurrentMonth)
  } else {
    balanceLabel = "Sin adeudo"
    balanceAmount = 0
  }

  const dueDayClamped = clampDueDay(period.year, period.month, lease.due_day)
  const dueDate = new Date(period.year, period.month - 1, dueDayClamped)

  const paidMonths = Math.floor(totalPaidLifetime / rentAmount)
  const startDate = new Date(`${lease.start_date}T00:00:00`)
  const createdAt = lease.created_at ? new Date(lease.created_at) : null
  const createdMonthStart = createdAt
    ? new Date(createdAt.getFullYear(), createdAt.getMonth(), 1)
    : null
  const effectiveStart =
    createdMonthStart && createdMonthStart > startDate
      ? createdMonthStart
      : startDate

  let paidUntilLabel = "Sin mensualidades cubiertas"
  let nextDueDate: Date | null = null
  if (paidMonths > 0) {
    const paidUntil = new Date(effectiveStart)
    paidUntil.setMonth(effectiveStart.getMonth() + paidMonths - 1)
    paidUntilLabel = paidUntil.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    })
    nextDueDate = new Date(
      effectiveStart.getFullYear(),
      effectiveStart.getMonth() + paidMonths,
      dueDayClamped
    )
  }

  let status: PaymentStatus
  if (paidCurrentMonth >= rentAmount) {
    status = "pagado"
  } else if (paidCurrentMonth > 0) {
    status = "parcial"
  } else if (period.day > dueDayClamped) {
    status = "atrasado"
  } else if (period.day === dueDayClamped) {
    status = "pendiente_pago"
  } else if (dueDayClamped - period.day <= 7) {
    status = "proximo_pago"
  } else {
    status = "pendiente"
  }

  return {
    status,
    rentAmount,
    paidCurrentMonth,
    remainingCurrentMonth,
    totalPaidLifetime,
    balanceCurrentMonth,
    balanceLabel,
    balanceAmount,
    paidMonths,
    paidUntilLabel,
    dueDate,
    nextDueDate,
  }
}

export function getLeasePaymentStatus(
  lease: LeaseLike | null | undefined,
  payments: PaymentLike[],
  period?: CurrentPeriod
): PaymentStatus {
  return getLeasePaymentSummary(lease, payments, period).status
}

export function formatAbsCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString("es-MX")}`
}
