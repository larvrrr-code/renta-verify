"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Trash2,
  Phone,
  Building2,
  CalendarClock,
  Link2,
} from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const supabase = createClient()

type Tenant = {
  id: string
  name: string | null
  phone: string | null
  user_id: string | null
}

type Property = {
  id: string
  name: string | null
  address: string | null
  user_id: string | null
}

type Lease = {
  id: string
  property_id: string | null
  tenant_id: string | null
  rent_amount: number | null
  due_day: number | null
  start_date: string | null
  end_date: string | null
  status: string | null
  user_id: string | null
  created_at: string | null
}

type Payment = {
  id: string
  lease_id: string | null
  amount: number | null
  period_month: number | null
  period_year: number | null
  user_id: string | null
}

type TenantStatus = "al_corriente" | "proximo_pago" | "atrasado" | "sin_contrato"

type TenantSummary = {
  tenant: Tenant
  property: Property | null
  lease: Lease | null
  status: TenantStatus
  nextPaymentDate: Date | null
  balance: number
}

const statusStyles: Record<TenantStatus, { label: string; className: string }> = {
  al_corriente: {
    label: "Al corriente",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  proximo_pago: {
    label: "Próximo a pagar",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  atrasado: {
    label: "Atrasado",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  sin_contrato: {
    label: "Sin contrato",
    className:
      "border border-[#3E61D0] bg-transparent text-[#3E61D0] hover:bg-transparent",
  },
}

function formatDate(date: Date | null) {
  if (!date) return "—"
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function computeTenantSummary(
  tenant: Tenant,
  leases: Lease[],
  payments: Payment[],
  properties: Property[]
): TenantSummary {
  const lease = leases.find(
    (l) => l.tenant_id === tenant.id && l.status === "active"
  ) || leases.find((l) => l.tenant_id === tenant.id) || null

  const property = lease
    ? properties.find((p) => p.id === lease.property_id) || null
    : null

  if (!lease || !lease.rent_amount || !lease.start_date) {
    return {
      tenant,
      property,
      lease,
      status: "sin_contrato",
      nextPaymentDate: null,
      balance: 0,
    }
  }

  const rentAmount = Number(lease.rent_amount)
  const today = new Date()
  const startDate = new Date(`${lease.start_date}T00:00:00`)

  const createdAt = lease.created_at ? new Date(lease.created_at) : null
  const createdAtMonthStart = createdAt
    ? new Date(createdAt.getFullYear(), createdAt.getMonth(), 1)
    : null

  const effectiveStart =
    createdAtMonthStart && createdAtMonthStart > startDate
      ? createdAtMonthStart
      : startDate

  const leasePayments = payments.filter((p) => p.lease_id === lease.id)
  const totalPaid = leasePayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )

  const monthsElapsed =
    (today.getFullYear() - effectiveStart.getFullYear()) * 12 +
    (today.getMonth() - effectiveStart.getMonth()) +
    1

  const expectedAmount = Math.max(monthsElapsed, 0) * rentAmount
  const balance = totalPaid - expectedAmount
  const paidMonths = Math.floor(totalPaid / rentAmount)

  const dueDay = Math.min(Math.max(Number(lease.due_day || 1), 1), 28)

  const nextPaymentDate = new Date(
    effectiveStart.getFullYear(),
    effectiveStart.getMonth() + paidMonths,
    dueDay
  )

  let status: TenantStatus
  if (balance < 0) {
    status = "atrasado"
  } else {
    const daysUntilDue = Math.ceil(
      (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    status = daysUntilDue <= 7 ? "proximo_pago" : "al_corriente"
  }

  return { tenant, property, lease, status, nextPaymentDate, balance }
}

export function TenantsManagement() {
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [assigningTenant, setAssigningTenant] = useState<Tenant | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState("")

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setCurrentUserId(user.id)

    const [
      { data: tenantsData, error: tenantsError },
      { data: propertiesData, error: propertiesError },
      { data: leasesData, error: leasesError },
      { data: paymentsData, error: paymentsError },
    ] = await Promise.all([
      supabase
        .from("tenants")
        .select("id, name, phone, user_id")
        .eq("user_id", user.id),
      supabase
        .from("properties")
        .select("id, name, address, user_id")
        .eq("user_id", user.id),
      supabase
        .from("leases")
        .select(
          "id, property_id, tenant_id, rent_amount, due_day, start_date, end_date, status, user_id, created_at"
        )
        .eq("user_id", user.id),
      supabase
        .from("payments")
        .select("id, lease_id, amount, period_month, period_year, user_id")
        .eq("user_id", user.id),
    ])

    const firstError =
      tenantsError || propertiesError || leasesError || paymentsError
    if (firstError) {
      setErrorMessage(firstError.message)
      setLoading(false)
      return
    }

    setTenants(tenantsData ?? [])
    setProperties(propertiesData ?? [])
    setLeases(leasesData ?? [])
    setPayments(paymentsData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const tenantSummaries = useMemo(() => {
    return tenants
      .map((tenant) =>
        computeTenantSummary(tenant, leases, payments, properties)
      )
      .sort((a, b) => (a.tenant.name || "").localeCompare(b.tenant.name || ""))
  }, [tenants, leases, payments, properties])

  const propertiesWithoutLease = useMemo(() => {
    const occupied = new Set(
      leases
        .filter((l) => l.status === "active" && l.property_id)
        .map((l) => l.property_id as string)
    )
    return properties.filter((p) => !occupied.has(p.id))
  }, [leases, properties])

  const handleDelete = async (tenantId: string) => {
    if (!currentUserId) return

    setDeletingId(tenantId)
    setErrorMessage("")

    const tenantLeases = leases.filter((l) => l.tenant_id === tenantId)
    const leaseIds = tenantLeases.map((l) => l.id)

    if (leaseIds.length > 0) {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .in("lease_id", leaseIds)
        .eq("user_id", currentUserId)

      if (paymentsError) {
        setErrorMessage(paymentsError.message)
        setDeletingId(null)
        return
      }

      const { error: leasesError } = await supabase
        .from("leases")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("user_id", currentUserId)

      if (leasesError) {
        setErrorMessage(leasesError.message)
        setDeletingId(null)
        return
      }
    }

    const { error: tenantError } = await supabase
      .from("tenants")
      .delete()
      .eq("id", tenantId)
      .eq("user_id", currentUserId)

    if (tenantError) {
      setErrorMessage(tenantError.message)
      setDeletingId(null)
      return
    }

    await fetchData()
    setDeletingId(null)
  }

  const openAssignModal = (tenant: Tenant) => {
    setAssigningTenant(tenant)
    setSelectedPropertyId("")
  }

  const closeAssignModal = () => {
    setAssigningTenant(null)
    setSelectedPropertyId("")
  }

  const handleConfirmAssign = () => {
    if (!assigningTenant || !selectedPropertyId) return
    router.push(
      `/propiedades?edit=${selectedPropertyId}&tenantId=${assigningTenant.id}`
    )
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando inquilinos...</p>
    )
  }

  if (errorMessage) {
    return <p className="text-sm text-red-600">Error: {errorMessage}</p>
  }

  if (tenantSummaries.length === 0) {
    return (
      <Card style={{ border: "1.5px solid #94a3b8" }}>
        <CardContent className="py-12 text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#E8EEF9" }}
          >
            <User className="h-6 w-6 text-[#3E61D0]" />
          </div>
          <p className="mt-4 text-sm font-medium tracking-wider text-foreground">
            Aún no tienes inquilinos registrados.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Agrega un inquilino desde la sección de propiedades.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenantSummaries.map((summary) => {
          const statusStyle = statusStyles[summary.status]
          const hasLease = Boolean(summary.lease && summary.property)

          return (
            <Card
              key={summary.tenant.id}
              style={{ border: "1.5px solid #94a3b8" }}
            >
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#E8EEF9" }}
                    >
                      <User className="h-6 w-6 text-[#3E61D0]" />
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-wider text-foreground">
                        {summary.tenant.name || "Sin nombre"}
                      </h3>
                      {summary.tenant.phone ? (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {summary.tenant.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Badge className={statusStyle.className}>
                    {statusStyle.label}
                  </Badge>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Propiedad</p>
                      <p className="font-medium text-foreground">
                        {summary.property?.name || "Sin asignar"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Próximo pago
                      </p>
                      <p className="font-medium text-foreground">
                        {formatDate(summary.nextPaymentDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {!hasLease ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-[#3E61D0] transition-colors hover:bg-[#E8EEF9] hover:text-[#3E61D0]"
                      onClick={() => openAssignModal(summary.tenant)}
                      disabled={propertiesWithoutLease.length === 0}
                    >
                      <Link2 className="h-4 w-4" />
                      Asignar propiedad
                    </Button>
                  ) : (
                    <span />
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                        disabled={deletingId === summary.tenant.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="tracking-wider">
                          ¿Estás seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Eliminar un inquilino también borra el histórico de
                          los pagos que ha generado. Esta acción no se puede
                          deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="transition-colors hover:bg-muted">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(summary.tenant.id)}
                          className="bg-red-600 text-white transition-colors hover:bg-red-700"
                        >
                          Eliminar inquilino
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={Boolean(assigningTenant)}
        onOpenChange={(open) => {
          if (!open) closeAssignModal()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="tracking-wider">
              Asignar propiedad
            </DialogTitle>
            <DialogDescription>
              Selecciona una propiedad para {assigningTenant?.name || "este inquilino"}.
              Te llevaremos al editor de la propiedad con el inquilino preseleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Propiedad
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Seleccionar propiedad</option>
              {propertiesWithoutLease.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name || "Sin nombre"}
                </option>
              ))}
            </select>
            {propertiesWithoutLease.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay propiedades disponibles sin contrato activo.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeAssignModal}
              className="transition-colors hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAssign}
              disabled={!selectedPropertyId}
              className="bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
