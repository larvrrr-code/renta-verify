"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase"

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
  status: string | null
  due_day: number | null
  rent_amount: number | null
  start_date: string | null
  end_date: string | null
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

type PaymentStatus =
  | "sin_contrato"
  | "al_corriente"
  | "proximo_pago"
  | "pendiente_pago"
  | "atrasado"
  | "pagado"

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  sin_contrato: {
    label: "Sin contrato",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
  al_corriente: {
    label: "Al corriente",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  proximo_pago: {
    label: "Próximo de pago",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  pendiente_pago: {
    label: "Pendiente de pago",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  atrasado: {
    label: "Atrasado",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  pagado: {
    label: "Pagado",
    className: "border-green-200 bg-green-50 text-green-700",
  },
}

function getTodayDateForInput() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "—"

  const numericAmount = Number(amount)
  const absoluteAmount = Math.abs(numericAmount)
  const formatted = `$${absoluteAmount.toLocaleString("es-MX")}`

  return numericAmount < 0 ? `-${formatted}` : formatted
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

function getLeaseBalance(lease: Lease, payments: Payment[]) {
  const rentAmount = Number(lease.rent_amount || 0)

  const leasePayments = payments.filter(
    (payment) => payment.lease_id === lease.id
  )

  const totalPaid = leasePayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  )

  if (!rentAmount || !lease.start_date) {
    return {
      totalPaid,
      expectedAmount: 0,
      balance: totalPaid,
      paidMonths: 0,
      paidUntilLabel: "Sin fecha de inicio",
      status: "sin_contrato" as PaymentStatus,
    }
  }

  const today = new Date()
  const startDate = new Date(`${lease.start_date}T00:00:00`)

  const monthsElapsed =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth()) +
    1

  const expectedMonths = Math.max(monthsElapsed, 0)
  const expectedAmount = expectedMonths * rentAmount
  const balance = totalPaid - expectedAmount
  const paidMonths = Math.floor(totalPaid / rentAmount)

  const paidUntilDate = new Date(startDate)
  paidUntilDate.setMonth(startDate.getMonth() + paidMonths - 1)

  const paidUntilLabel =
    paidMonths > 0
      ? paidUntilDate.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        })
      : "Sin mensualidades cubiertas"

  return {
    totalPaid,
    expectedAmount,
    balance,
    paidMonths,
    paidUntilLabel,
    status:
      balance >= 0
        ? ("pagado" as PaymentStatus)
        : ("atrasado" as PaymentStatus),
  }
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
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState("")

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
          "id, property_id, status, due_day, rent_amount, start_date, end_date, user_id"
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

  const getPaymentStatus = (propertyId: string): PaymentStatus => {
    const activeLease = activeLeaseByPropertyId.get(propertyId)

    if (!activeLease) {
      return "sin_contrato"
    }

    const leaseBalance = getLeaseBalance(activeLease, payments)

    if (leaseBalance.status === "pagado") {
      return "pagado"
    }

    return "atrasado"
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

    setSelectedPropertyForPayment(property)
    setPaymentDate(getTodayDateForInput())
    setPaymentAmount(activeLease?.rent_amount ? String(activeLease.rent_amount) : "")
    setPaymentMethod("")
    setPaymentNotes("")
    setPaymentError("")
    setIsPaymentModalOpen(true)
  }

  const closePaymentModal = () => {
    if (isSavingPayment) return
    setIsPaymentModalOpen(false)
    setSelectedPropertyForPayment(null)
    setPaymentDate(getTodayDateForInput())
    setPaymentAmount("")
    setPaymentMethod("")
    setPaymentNotes("")
    setPaymentError("")
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

    setIsSavingPayment(true)
    setPaymentError("")

    const selectedDate = new Date(`${paymentDate}T00:00:00`)
    const periodMonth = selectedDate.getMonth() + 1
    const periodYear = selectedDate.getFullYear()

    const { error } = await supabase.from("payments").insert([
      {
        user_id: currentUserId,
        lease_id: activeLease.id,
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        period_month: periodMonth,
        period_year: periodYear,
        notes: paymentNotes.trim() || null,
      },
    ])

    if (error) {
      setPaymentError(error.message)
      setIsSavingPayment(false)
      return
    }

    await fetchData()
    setIsSavingPayment(false)
    closePaymentModal()
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
                  <TableHead className="hidden md:table-cell">Pago</TableHead>
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
                  const paymentStatus = getPaymentStatus(property.id)
                  const paymentBadge = paymentStatusConfig[paymentStatus]
                  const leaseBalance = activeLease
                    ? getLeaseBalance(activeLease, payments)
                    : null

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
                        {isOccupied ? (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-blue-700"
                          >
                            Ocupada
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700"
                          >
                            Disponible
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
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
                        {leaseBalance?.paidUntilLabel || "—"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {leaseBalance ? formatCurrency(leaseBalance.balance) : "—"}
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
              <Field label="Fecha de pago">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={inputClass()}
                  required
                />
              </Field>

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
                El periodo se calculará automáticamente con base en la fecha
                seleccionada.
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