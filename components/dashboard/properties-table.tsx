"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase"
import {
  getCurrentPeriod,
  getLeasePaymentSummary,
  getTodayDateForInput,
  paymentStatusConfig,
} from "@/lib/payment-status"

const supabase = createClient()

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const propertyTypeOptions = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "cuarto", label: "Cuarto" },
  { value: "local_comercial", label: "Local comercial" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
  { value: "nave_industrial", label: "Nave industrial" },
]

const paymentMethodOptions = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "deposito", label: "Depósito" },
]

type Property = {
  id: string
  name: string | null
  address: string | null
  property_type: string | null
  zip_code: string | null
  neighborhood: string | null
  user_id: string | null
  created_at: string | null
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
  created_at: string | null
  user_id?: string | null
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
  user_id?: string | null
}

type PendingPaymentAction = {
  leaseId: string
  amount: number
  payment_date: string
  payment_method: string
  period_month: number
  period_year: number
  notes: string | null
  existingPayments: Payment[]
}

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "—"
  return `$${Math.abs(Number(amount)).toLocaleString("es-MX")}`
}

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#213A6B] focus:ring-2 focus:ring-[#213A6B]/15"
}

function getOptionLabel(
  options: { value: string; label: string }[],
  value?: string | null
) {
  return options.find((option) => option.value === value)?.label || "—"
}

export function PropertiesTable() {
  const router = useRouter()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newPropertyType, setNewPropertyType] = useState("")
  const [newZipCode, setNewZipCode] = useState("")
  const [newNeighborhood, setNewNeighborhood] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] =
    useState<Property | null>(null)
  const [paymentDate, setPaymentDate] = useState(getTodayDateForInput())
  const [paymentPeriodKey, setPaymentPeriodKey] = useState(() => {
    const currentPeriod = getCurrentPeriod()
    return `${currentPeriod.year}-${String(currentPeriod.month).padStart(2, "0")}`
  })
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [pendingPaymentAction, setPendingPaymentAction] =
    useState<PendingPaymentAction | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] =
    useState<Property | null>(null)
  const [isDeletingPropertyId, setIsDeletingPropertyId] = useState<string | null>(
    null
  )
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id ?? null)
    }

    loadUser()
  }, [])

  const fetchData = async () => {
    if (!currentUserId) {
      setLoading(false)
      setProperties([])
      setLeases([])
      setPayments([])
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
        .select(
          "id, name, address, property_type, zip_code, neighborhood, user_id, created_at"
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false }),

      supabase
        .from("leases")
        .select(
          "id, property_id, tenant_id, status, due_day, rent_amount, start_date, end_date, created_at, user_id"
        )
        .eq("user_id", currentUserId),

      supabase
        .from("payments")
        .select(
          "id, lease_id, amount, payment_date, payment_method, period_month, period_year, notes, user_id"
        )
        .eq("user_id", currentUserId),
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

  useEffect(() => {
    if (currentUserId) {
      fetchData()
    }
  }, [currentUserId])

  const activeLeaseByPropertyId = useMemo(() => {
    const map = new Map<string, Lease>()

    leases
      .filter((lease) => lease.property_id && lease.status === "active")
      .forEach((lease) => {
        if (lease.property_id) {
          map.set(lease.property_id, lease)
        }
      })

    return map
  }, [leases])

  const period = useMemo(() => getCurrentPeriod(), [])
  const paymentPeriodOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date(period.year, period.month - 1 - index, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      return {
        value: `${year}-${String(month).padStart(2, "0")}`,
        month,
        year,
        label: date.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        }),
      }
    })
  }, [period.year])

  const getSummaryFor = (propertyId: string) => {
    const activeLease = activeLeaseByPropertyId.get(propertyId)
    return getLeasePaymentSummary(activeLease ?? null, payments, period)
  }

  const resetForm = () => {
    setNewName("")
    setNewAddress("")
    setNewPropertyType("")
    setNewZipCode("")
    setNewNeighborhood("")
    setSaveError("")
  }

  const handleCloseModal = () => {
    if (isSaving) return
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUserId) {
      setSaveError("No se encontró el usuario autenticado.")
      return
    }

    const trimmedName = newName.trim()
    const trimmedAddress = newAddress.trim()
    const trimmedZipCode = newZipCode.trim()
    const trimmedNeighborhood = newNeighborhood.trim()

    if (
      !trimmedName ||
      !trimmedAddress ||
      !newPropertyType ||
      !trimmedZipCode ||
      !trimmedNeighborhood
    ) {
      setSaveError("Completa nombre, tipo, dirección, código postal y colonia.")
      return
    }

    if (!/^\d{5}$/.test(trimmedZipCode)) {
      setSaveError("El código postal debe tener exactamente 5 dígitos.")
      return
    }

    setIsSaving(true)
    setSaveError("")

    const { error } = await supabase.from("properties").insert([
      {
        name: trimmedName,
        address: trimmedAddress,
        property_type: newPropertyType,
        zip_code: trimmedZipCode,
        neighborhood: trimmedNeighborhood,
        user_id: currentUserId,
      },
    ])

    if (error) {
      setSaveError(error.message)
      setIsSaving(false)
      return
    }

    await fetchData()
    setIsSaving(false)
    setIsAddModalOpen(false)
    resetForm()
  }

  const openPaymentModal = (property: Property) => {
    const activeLease = activeLeaseByPropertyId.get(property.id)
    const currentPeriod = getCurrentPeriod()

    setSelectedPropertyForPayment(property)
    setPaymentDate(getTodayDateForInput())
    setPaymentPeriodKey(
      `${currentPeriod.year}-${String(currentPeriod.month).padStart(2, "0")}`
    )
    setPaymentAmount(activeLease?.rent_amount ? String(activeLease.rent_amount) : "")
    setPaymentMethod("")
    setPaymentNotes("")
    setPaymentError("")
    setPendingPaymentAction(null)
    setIsPaymentModalOpen(true)
  }

  const closePaymentModal = () => {
    if (isSavingPayment) return
    const currentPeriod = getCurrentPeriod()
    setIsPaymentModalOpen(false)
    setSelectedPropertyForPayment(null)
    setPaymentDate(getTodayDateForInput())
    setPaymentPeriodKey(
      `${currentPeriod.year}-${String(currentPeriod.month).padStart(2, "0")}`
    )
    setPaymentAmount("")
    setPaymentMethod("")
    setPaymentNotes("")
    setPaymentError("")
    setPendingPaymentAction(null)
  }

  const persistPayment = async (
    draft: PendingPaymentAction,
    action: "sum" | "replace"
  ) => {
    if (!currentUserId) {
      setPaymentError("No se encontrÃ³ el usuario autenticado.")
      return
    }

    setIsSavingPayment(true)
    setPaymentError("")

    if (action === "replace") {
      if (draft.existingPayments.length === 1) {
        const { error } = await supabase
          .from("payments")
          .update({
            amount: draft.amount,
            payment_date: draft.payment_date,
            payment_method: draft.payment_method,
            period_month: draft.period_month,
            period_year: draft.period_year,
            notes: draft.notes,
          })
          .eq("id", draft.existingPayments[0].id)
          .eq("user_id", currentUserId)

        if (error) {
          setPaymentError(error.message)
          setIsSavingPayment(false)
          return
        }
      } else {
        const existingPaymentIds = draft.existingPayments.map((payment) => payment.id)

        const { error: deleteError } = await supabase
          .from("payments")
          .delete()
          .eq("user_id", currentUserId)
          .in("id", existingPaymentIds)

        if (deleteError) {
          setPaymentError(deleteError.message)
          setIsSavingPayment(false)
          return
        }

        const { error: insertError } = await supabase.from("payments").insert([
          {
            user_id: currentUserId,
            lease_id: draft.leaseId,
            amount: draft.amount,
            payment_date: draft.payment_date,
            payment_method: draft.payment_method,
            period_month: draft.period_month,
            period_year: draft.period_year,
            notes: draft.notes,
          },
        ])

        if (insertError) {
          setPaymentError(insertError.message)
          setIsSavingPayment(false)
          return
        }
      }
    } else {
      const { error } = await supabase.from("payments").insert([
        {
          user_id: currentUserId,
          lease_id: draft.leaseId,
          amount: draft.amount,
          payment_date: draft.payment_date,
          payment_method: draft.payment_method,
          period_month: draft.period_month,
          period_year: draft.period_year,
          notes: draft.notes,
        },
      ])

      if (error) {
        setPaymentError(error.message)
        setIsSavingPayment(false)
        return
      }
    }

    await fetchData()
    setIsSavingPayment(false)
    closePaymentModal()
  }

  const handleRegisterPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUserId) {
      setPaymentError("No se encontró el usuario autenticado.")
      return
    }

    if (!selectedPropertyForPayment) {
      setPaymentError("No se encontró la propiedad seleccionada.")
      return
    }

    const activeLease = activeLeaseByPropertyId.get(selectedPropertyForPayment.id)

    if (!activeLease) {
      setPaymentError("Esta propiedad no tiene un contrato activo.")
      return
    }

    const amount = Number(paymentAmount)

    if (!paymentAmount || Number.isNaN(amount) || amount <= 0) {
      setPaymentError("El monto recibido debe ser mayor a 0.")
      return
    }

    if (!paymentMethod) {
      setPaymentError("Selecciona la forma de pago.")
      return
    }

    if (!paymentDate) {
      setPaymentError("Selecciona la fecha de pago.")
      return
    }

    const selectedPeriod = paymentPeriodOptions.find(
      (option) => option.value === paymentPeriodKey
    )

    if (!selectedPeriod) {
      setPaymentError("Selecciona el mes que cubre este pago.")
      return
    }

    if (activeLease.start_date && paymentDate < activeLease.start_date) {
      setPaymentError("La fecha de pago no puede ser anterior al inicio del contrato.")
      return
    }

    if (activeLease.start_date) {
      const contractStart = new Date(`${activeLease.start_date}T00:00:00`)
      const contractStartMonth = contractStart.getMonth() + 1
      const contractStartYear = contractStart.getFullYear()

      if (
        selectedPeriod.year < contractStartYear ||
        (selectedPeriod.year === contractStartYear &&
          selectedPeriod.month < contractStartMonth)
      ) {
        setPaymentError("El mes que cubre no puede ser anterior al inicio del contrato.")
        return
      }
    }

    setPaymentError("")

    const draft: PendingPaymentAction = {
      leaseId: activeLease.id,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      period_month: selectedPeriod.month,
      period_year: selectedPeriod.year,
      notes: paymentNotes.trim() || null,
      existingPayments: payments.filter(
        (payment) =>
          payment.lease_id === activeLease.id &&
          payment.period_month === selectedPeriod.month &&
          payment.period_year === selectedPeriod.year
      ),
    }

    if (draft.existingPayments.length > 0) {
      setPendingPaymentAction(draft)
      return
    }

    await persistPayment(draft, "sum")
  }

  const openDeleteModal = (property: Property) => {
    setSelectedPropertyForDelete(property)
    setDeleteError("")
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (isDeletingPropertyId) return
    setIsDeleteModalOpen(false)
    setSelectedPropertyForDelete(null)
    setDeleteError("")
  }

  const handleDeleteProperty = async () => {
    if (!selectedPropertyForDelete) return

    setIsDeletingPropertyId(selectedPropertyForDelete.id)
    setDeleteError("")
    setErrorMessage("")

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", selectedPropertyForDelete.id)
      .eq("user_id", currentUserId)

    if (error) {
      setDeleteError(error.message)
      setIsDeletingPropertyId(null)
      return
    }

    await fetchData()
    setIsDeletingPropertyId(null)
    closeDeleteModal()
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Propiedades</CardTitle>
            <CardDescription>
              Gestiona tus propiedades y su estatus de pago
            </CardDescription>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Agregar propiedad
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando propiedades...
            </p>
          ) : errorMessage ? (
            <p className="text-sm text-red-600">Error: {errorMessage}</p>
          ) : properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay propiedades registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead className="hidden md:table-cell">Dirección</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead className="hidden md:table-cell">Monto</TableHead>
                  <TableHead className="hidden md:table-cell">Pagado hasta</TableHead>
                  <TableHead className="hidden md:table-cell">Saldo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {properties.map((property) => {
                  const activeLease = activeLeaseByPropertyId.get(property.id)
                  const isOccupied = Boolean(activeLease)
                  const summary = getSummaryFor(property.id)
                  const paymentBadge = paymentStatusConfig[summary.status]
                  const hasContract = isOccupied && summary.status !== "sin_contrato"

                  return (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        {property.name || "Sin nombre"}
                      </TableCell>

                      <TableCell className="hidden max-w-[300px] md:table-cell">
                        <div className="truncate text-muted-foreground">
                          {property.address || "Sin dirección"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground/80">
                          {property.neighborhood || "Sin colonia"}
                          {property.zip_code ? ` · CP ${property.zip_code}` : ""}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {getOptionLabel(propertyTypeOptions, property.property_type)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={paymentBadge.className}
                        >
                          {paymentBadge.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden font-medium md:table-cell">
                        {formatCurrency(activeLease?.rent_amount)}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {hasContract ? summary.paidUntilLabel : "—"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {hasContract
                          ? `${summary.balanceLabel}: ${formatCurrency(summary.balanceAmount)}`
                          : "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push("/propiedades")}
                            >
                              Editar propiedades
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openPaymentModal(property)}
                            >
                              Registrar pago
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openDeleteModal(property)}
                              disabled={isDeletingPropertyId === property.id}
                              className="text-red-600 transition-colors hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                            >
                              {isDeletingPropertyId === property.id
                                ? "Eliminando..."
                                : "Eliminar propiedad"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <ModalHeader
              title="Agregar propiedad"
              description="Completa los datos básicos del inmueble."
              onClose={handleCloseModal}
            />

            <form onSubmit={handleCreateProperty} className="space-y-5 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre de la propiedad">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={inputClass()}
                    placeholder="Ej. Departamento Providencia"
                    required
                  />
                </Field>

                <Field label="Tipo de propiedad">
                  <select
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value)}
                    className={inputClass()}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {propertyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Dirección">
                  <input
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className={inputClass()}
                    placeholder="Ej. Av. México 123"
                    required
                  />
                </Field>

                <Field label="Código postal">
                  <input
                    value={newZipCode}
                    onChange={(e) =>
                      setNewZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
                    }
                    className={inputClass()}
                    placeholder="Ej. 44600"
                    inputMode="numeric"
                    maxLength={5}
                    required
                  />
                </Field>

                <Field label="Colonia">
                  <input
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className={inputClass()}
                    placeholder="Ej. Providencia"
                    required
                  />
                </Field>
              </div>

              {saveError ? (
                <p className="text-sm text-red-600">Error: {saveError}</p>
              ) : null}

              <ModalFooter
                onCancel={handleCloseModal}
                disabled={isSaving}
                submitLabel={isSaving ? "Guardando..." : "Guardar propiedad"}
              />
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <ModalHeader
              title="Registrar pago"
              description={
                selectedPropertyForPayment?.name || "Propiedad seleccionada"
              }
              onClose={closePaymentModal}
            />

            <form onSubmit={handleRegisterPayment} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha de pago">
                  <input
                    type="date"
                    value={paymentDate}
                    min={selectedPropertyForPayment
                      ? activeLeaseByPropertyId.get(selectedPropertyForPayment.id)?.start_date || undefined
                      : undefined}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={inputClass()}
                    required
                  />
                </Field>

                <Field label="Mes y año que cubre">
                  <select
                    value={paymentPeriodKey}
                    onChange={(e) => setPaymentPeriodKey(e.target.value)}
                    className={inputClass()}
                    required
                  >
                    {paymentPeriodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <p className="-mt-2 text-sm text-muted-foreground">
                Selecciona el mes de renta al que corresponde este pago.
              </p>

              <Field label="Monto recibido">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={inputClass()}
                  placeholder="Ej. 12000"
                  min="1"
                  required
                />
              </Field>

              <Field label="Forma de pago">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputClass()}
                  required
                >
                  <option value="">Seleccionar</option>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Notas del pago">
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className={`${inputClass()} min-h-[100px] resize-none`}
                  placeholder="Opcional. Ej. Pago parcial, adelanto, transferencia pendiente de validar..."
                />
              </Field>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                La fecha de pago se guarda como historial. El estatus del pago
                se calcula con base en el mes de renta que selecciones.
              </div>

              {paymentError ? (
                <p className="text-sm text-red-600">Error: {paymentError}</p>
              ) : null}

              <ModalFooter
                onCancel={closePaymentModal}
                disabled={isSavingPayment}
                submitLabel={isSavingPayment ? "Guardando..." : "Registrar pago"}
              />
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && pendingPaymentAction ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <ModalHeader
              title="Pago ya registrado"
              description="Ya existe un pago registrado para este periodo."
              onClose={() => {
                if (isSavingPayment) return
                setPendingPaymentAction(null)
              }}
            />

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                {pendingPaymentAction.existingPayments.length === 1
                  ? "Ya existe 1 pago registrado para este periodo."
                  : `Ya existen ${pendingPaymentAction.existingPayments.length} pagos registrados para este periodo.`}{" "}
                ¿Qué deseas hacer?
              </p>

              <div className="grid gap-3">
                <Button
                  type="button"
                  onClick={() => persistPayment(pendingPaymentAction, "sum")}
                  disabled={isSavingPayment}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Sumarlo al periodo
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => persistPayment(pendingPaymentAction, "replace")}
                  disabled={isSavingPayment}
                >
                  Reemplazar pago anterior
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPendingPaymentAction(null)}
                  disabled={isSavingPayment}
                >
                  Cancelar
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Si eliges reemplazar y ya existen varios pagos para ese mismo
                periodo, se consolidarán en un solo registro nuevo.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen && selectedPropertyForDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <ModalHeader
              title="Eliminar propiedad"
              description="Esta acción no se puede deshacer."
              onClose={closeDeleteModal}
            />

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                ¿Seguro que quieres eliminar la propiedad{" "}
                <span className="font-medium text-foreground">
                  {selectedPropertyForDelete.name || "Sin nombre"}
                </span>
                ?
              </div>

              {deleteError ? (
                <p className="text-sm text-red-600">Error: {deleteError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteModal}
                  disabled={Boolean(isDeletingPropertyId)}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={handleDeleteProperty}
                  disabled={Boolean(isDeletingPropertyId)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isDeletingPropertyId
                    ? "Eliminando..."
                    : "Eliminar propiedad"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string
  description?: string
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h3 className="text-lg font-semibold tracking-wider text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ModalFooter({
  onCancel,
  disabled,
  submitLabel,
}: {
  onCancel: () => void
  disabled: boolean
  submitLabel: string
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={disabled}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        className="bg-accent text-accent-foreground hover:bg-accent/90"
        disabled={disabled}
      >
        {submitLabel}
      </Button>
    </div>
  )
}
