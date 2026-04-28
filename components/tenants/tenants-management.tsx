"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Trash2,
  Building2,
  CalendarClock,
  Link2,
  Info,
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
import {
  PaymentStatus,
  paymentStatusConfig,
  getCurrentPeriod,
  getLeasePaymentSummary,
} from "@/lib/payment-status"

const supabase = createClient()

type Tenant = {
  id: string
  name: string | null
  phone: string | null
  tenant_source: string | null
  age_range: string | null
  occupation_type: string | null
  dependents_range: string | null
  has_pets: boolean | null
  notes: string | null
  user_id: string | null
}

const tenantSourceOptions = [
  { value: "recomendacion_familiar_conocido", label: "Recomendación de familiar o conocido" },
  { value: "recomendacion_inquilino_anterior", label: "Recomendación de inquilino anterior" },
  { value: "red_social", label: "Red social" },
  { value: "plataforma_digital", label: "Plataforma digital" },
  { value: "agencia_inmobiliaria", label: "Agencia inmobiliaria" },
  { value: "anuncio_propio", label: "Anuncio propio" },
  { value: "ya_lo_conocia", label: "Ya lo conocía previamente" },
  { value: "otro", label: "Otro" },
]

const ageRangeOptions = [
  { value: "18-25", label: "18 a 25" },
  { value: "26-35", label: "26 a 35" },
  { value: "36-45", label: "36 a 45" },
  { value: "46-60", label: "46 a 60" },
  { value: "61+", label: "Más de 61" },
]

const occupationTypeOptions = [
  { value: "empleo_formal", label: "Empleo formal / nómina" },
  { value: "negocio_propio", label: "Negocio propio" },
  { value: "freelance", label: "Trabajo independiente / freelance" },
  { value: "comisiones_ventas", label: "Comisiones / ventas" },
  { value: "apoyo_familiar", label: "Apoyo familiar" },
  { value: "rentas_inversiones", label: "Rentas / inversiones" },
  { value: "otro", label: "Otro" },
]

const dependentsRangeOptions = [
  { value: "0", label: "0" },
  { value: "1-2", label: "1 a 2" },
  { value: "3-4", label: "3 a 4" },
  { value: "5+", label: "Más de 5" },
]

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

type TenantSummary = {
  tenant: Tenant
  property: Property | null
  lease: Lease | null
  status: PaymentStatus
  nextPaymentDate: Date | null
  balance: number
}

const statusStyles: Record<PaymentStatus, { label: string; className: string }> = {
  ...paymentStatusConfig,
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

  const summary = getLeasePaymentSummary(lease, payments, getCurrentPeriod())

  return {
    tenant,
    property,
    lease,
    status: summary.status,
    nextPaymentDate: summary.nextDueDate ?? summary.dueDate,
    balance: summary.balanceCurrentMonth,
  }
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
  const [detailsTenant, setDetailsTenant] = useState<Tenant | null>(null)
  const [detailsName, setDetailsName] = useState("")
  const [detailsSource, setDetailsSource] = useState("")
  const [detailsAgeRange, setDetailsAgeRange] = useState("")
  const [detailsOccupation, setDetailsOccupation] = useState("")
  const [detailsDependents, setDetailsDependents] = useState("")
  const [detailsHasPets, setDetailsHasPets] = useState("")
  const [detailsNotes, setDetailsNotes] = useState("")
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState("")

  const openDetails = (tenant: Tenant) => {
    setDetailsTenant(tenant)
    setDetailsName(tenant.name || "")
    setDetailsSource(tenant.tenant_source || "")
    setDetailsAgeRange(tenant.age_range || "")
    setDetailsOccupation(tenant.occupation_type || "")
    setDetailsDependents(tenant.dependents_range || "")
    setDetailsHasPets(
      tenant.has_pets === null || tenant.has_pets === undefined
        ? ""
        : tenant.has_pets
        ? "true"
        : "false"
    )
    setDetailsNotes(tenant.notes || "")
    setDetailsError("")
  }

  const closeDetails = () => {
    setDetailsTenant(null)
    setDetailsError("")
  }

  const handleSaveDetails = async () => {
    if (!detailsTenant || !currentUserId) return

    if (!detailsName.trim()) {
      setDetailsError("El alias es obligatorio.")
      return
    }

    setSavingDetails(true)
    setDetailsError("")

    const { error } = await supabase
      .from("tenants")
      .update({
        name: detailsName.trim(),
        tenant_source: detailsSource || null,
        age_range: detailsAgeRange || null,
        occupation_type: detailsOccupation || null,
        dependents_range: detailsDependents || null,
        has_pets:
          detailsHasPets === "" ? null : detailsHasPets === "true",
        notes: detailsNotes.trim() || null,
      })
      .eq("id", detailsTenant.id)
      .eq("user_id", currentUserId)

    if (error) {
      setDetailsError(error.message)
      setSavingDetails(false)
      return
    }

    await fetchData()
    setSavingDetails(false)
    closeDetails()
  }

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
        .select(
          "id, name, phone, tenant_source, age_range, occupation_type, dependents_range, has_pets, notes, user_id"
        )
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

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-[#3E61D0] transition-colors hover:bg-[#E8EEF9] hover:text-[#3E61D0]"
                      onClick={() => openDetails(summary.tenant)}
                    >
                      <Info className="h-4 w-4" />
                      Detalles
                    </Button>

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
                    ) : null}
                  </div>

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

      <Dialog
        open={Boolean(detailsTenant)}
        onOpenChange={(open) => {
          if (!open) closeDetails()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="tracking-wider">
              Detalles del inquilino
            </DialogTitle>
            <DialogDescription>
              Consulta y actualiza la información del inquilino.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <DetailField label="Alias" required>
              <input
                value={detailsName}
                onChange={(e) => setDetailsName(e.target.value)}
                className={detailsInputClass()}
                placeholder="Alias"
              />
            </DetailField>

            <DetailField label="¿Cómo lo contactaste?">
              <select
                value={detailsSource}
                onChange={(e) => setDetailsSource(e.target.value)}
                className={detailsInputClass()}
              >
                <option value="">Selecciona una opción</option>
                {tenantSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </DetailField>

            <DetailField label="Rango de edad">
              <select
                value={detailsAgeRange}
                onChange={(e) => setDetailsAgeRange(e.target.value)}
                className={detailsInputClass()}
              >
                <option value="">Selecciona una opción</option>
                {ageRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </DetailField>

            <DetailField label="Tipo de ocupación">
              <select
                value={detailsOccupation}
                onChange={(e) => setDetailsOccupation(e.target.value)}
                className={detailsInputClass()}
              >
                <option value="">Selecciona una opción</option>
                {occupationTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </DetailField>

            <DetailField label="Número de inquilinos">
              <select
                value={detailsDependents}
                onChange={(e) => setDetailsDependents(e.target.value)}
                className={detailsInputClass()}
              >
                <option value="">Selecciona una opción</option>
                {dependentsRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </DetailField>

            <DetailField label="¿Tiene mascotas?">
              <select
                value={detailsHasPets}
                onChange={(e) => setDetailsHasPets(e.target.value)}
                className={detailsInputClass()}
              >
                <option value="">Selecciona una opción</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </DetailField>

            <DetailField label="Notas">
              <textarea
                value={detailsNotes}
                onChange={(e) => setDetailsNotes(e.target.value)}
                className={`${detailsInputClass()} min-h-[90px] resize-none`}
                placeholder="Información adicional"
              />
            </DetailField>

            {detailsError ? (
              <p className="text-sm text-red-600">{detailsError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDetails}
              className="transition-colors hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDetails}
              disabled={savingDetails || !detailsName.trim()}
              className="bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
            >
              {savingDetails ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function detailsInputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#213A6B] focus:ring-2 focus:ring-[#213A6B]/15"
}

function DetailField({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      {children}
    </div>
  )
}
