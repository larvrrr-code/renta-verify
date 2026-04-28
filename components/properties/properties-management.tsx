"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  CreditCard,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"

import { createClient } from "@/lib/supabase"
import {
  PaymentStatus,
  getCurrentPeriod,
  getLeasePaymentSummary,
  getTodayDateForInput as getTodayDateForInputLib,
  paymentStatusConfig,
} from "@/lib/payment-status"
const supabase = createClient()

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const propertyTypeOptions = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "cuarto", label: "Cuarto" },
  { value: "local_comercial", label: "Local comercial" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
  { value: "nave_industrial", label: "Nave industrial" },
]

const occupantsRangeOptions = [
  { value: "1", label: "1" },
  { value: "2-3", label: "2 a 3" },
  { value: "4-5", label: "4 a 5" },
  { value: "6+", label: "Más de 6" },
]

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
  rent_amount: number | null
  due_day: number | null
  start_date: string | null
  end_date: string | null
  status: string | null
  user_id: string | null
  created_at?: string | null
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
  created_at: string | null
}

type EditDraft = {
  name: string
  address: string
  propertyType: string
  zipCode: string
  neighborhood: string
  tenantId: string
  rentAmount: string
  dueDay: string
  startDate: string
  endDate: string
  currentMonthPaid: boolean
}

const getTodayDateForInput = getTodayDateForInputLib

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return "—"
  return `$${Math.abs(Number(amount)).toLocaleString("es-MX")}`
}

function getOptionLabel(
  options: { value: string; label: string }[],
  value?: string | null
) {
  return options.find((option) => option.value === value)?.label || "—"
}

function getInitialDraft(property: Property, lease?: Lease | null): EditDraft {
  return {
    name: property.name ?? "",
    address: property.address ?? "",
    propertyType: property.property_type ?? "",
    zipCode: property.zip_code ?? "",
    neighborhood: property.neighborhood ?? "",
    tenantId: lease?.tenant_id ?? "",
    rentAmount: lease?.rent_amount ? String(lease.rent_amount) : "",
    dueDay: lease?.due_day ? String(lease.due_day) : "",
    startDate: lease?.start_date ?? "",
    endDate: lease?.end_date ?? "",
    currentMonthPaid: false,
  }
}

export function PropertiesManagement() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState<Property | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [isSavingPropertyId, setIsSavingPropertyId] = useState<string | null>(null)
  const [editError, setEditError] = useState("")

  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newPropertyType, setNewPropertyType] = useState("")
  const [newZipCode, setNewZipCode] = useState("")
  const [newNeighborhood, setNewNeighborhood] = useState("")
  const [newOccupantsRange, setNewOccupantsRange] = useState("")
  const [isCreatingProperty, setIsCreatingProperty] = useState(false)
  const [createPropertyError, setCreatePropertyError] = useState("")

  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false)
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState<Property | null>(null)
  const [tenantName, setTenantName] = useState("")
  const [tenantSource, setTenantSource] = useState("")
  const [tenantAgeRange, setTenantAgeRange] = useState("")
  const [tenantOccupationType, setTenantOccupationType] = useState("")
  const [tenantDependentsRange, setTenantDependentsRange] = useState("")
  const [tenantHasPets, setTenantHasPets] = useState("")
  const [tenantNotes, setTenantNotes] = useState("")
  const [isCreatingTenant, setIsCreatingTenant] = useState(false)
  const [createTenantError, setCreateTenantError] = useState("")

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState<Property | null>(null)
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
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] = useState<Property | null>(null)
  const [isDeletingPropertyId, setIsDeletingPropertyId] = useState<string | null>(null)
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
      setTenants([])
      return
    }

    setLoading(true)
    setErrorMessage("")

    const [
      { data: propertiesData, error: propertiesError },
      { data: leasesData, error: leasesError },
      { data: paymentsData, error: paymentsError },
      { data: tenantsData, error: tenantsError },
    ] = await Promise.all([
      supabase
        .from("properties")
        .select("id, name, address, property_type, zip_code, neighborhood, user_id, created_at")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false }),

      supabase
        .from("leases")
        .select("id, property_id, tenant_id, rent_amount, due_day, start_date, end_date, status, user_id, created_at")
        .eq("user_id", currentUserId),

      supabase
        .from("payments")
        .select("id, lease_id, amount, payment_date, payment_method, period_month, period_year, notes, user_id")
        .eq("user_id", currentUserId),

      supabase
        .from("tenants")
        .select("id, name, phone, tenant_source, age_range, occupation_type, dependents_range, has_pets, notes, user_id, created_at")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false }),
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

    if (tenantsError) {
      setErrorMessage(tenantsError.message)
      setLoading(false)
      return
    }

    setProperties(propertiesData ?? [])
    setLeases(leasesData ?? [])
    setPayments(paymentsData ?? [])

    const uniqueTenants = Array.from(
      new Map((tenantsData ?? []).map((tenant) => [tenant.id, tenant])).values()
    )

    setTenants(uniqueTenants)
    setLoading(false)
  }

  useEffect(() => {
    if (currentUserId) {
      fetchData()
    }
  }, [currentUserId])

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const currentDay = today.getDate()

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

  const tenantById = useMemo(() => {
    const map = new Map<string, Tenant>()

    tenants.forEach((tenant) => {
      map.set(tenant.id, tenant)
    })

    return map
  }, [tenants])

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

  const getPaymentStatus = (propertyId: string): PaymentStatus =>
    getSummaryFor(propertyId).status

  const openEdit = (property: Property, presetTenantId?: string) => {
    const activeLease = activeLeaseByPropertyId.get(property.id)
    setSelectedPropertyForEdit(property)
    const draft = getInitialDraft(property, activeLease)
    if (presetTenantId && !activeLease) {
      draft.tenantId = presetTenantId
    }
    setEditDraft(draft)
    setEditError("")
    setIsEditModalOpen(true)
  }

  useEffect(() => {
    if (loading || properties.length === 0) return
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const editPropertyId = params.get("edit")
    const presetTenantId = params.get("tenantId") || undefined

    if (editPropertyId) {
      const property = properties.find((p) => p.id === editPropertyId)
      if (property) {
        openEdit(property, presetTenantId)
        const url = new URL(window.location.href)
        url.searchParams.delete("edit")
        url.searchParams.delete("tenantId")
        window.history.replaceState({}, "", url.toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, properties])

  const closeEditModal = () => {
    if (isSavingPropertyId) return
    setSelectedPropertyForEdit(null)
    setEditDraft(null)
    setEditError("")
    setIsEditModalOpen(false)
  }

  const handleDraftChange = (field: keyof EditDraft, value: string) => {
    setEditDraft((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }

  const handleSaveProperty = async (property: Property) => {
    if (!currentUserId || !editDraft) {
      setEditError("No se pudo cargar la información para guardar.")
      return
    }

    const trimmedName = editDraft.name.trim()
    const trimmedAddress = editDraft.address.trim()
    const trimmedZipCode = editDraft.zipCode.trim()
    const trimmedNeighborhood = editDraft.neighborhood.trim()
    const tenantId = editDraft.tenantId || null
    const rentAmount = editDraft.rentAmount ? Number(editDraft.rentAmount) : null
    const dueDay = editDraft.dueDay ? Number(editDraft.dueDay) : null

    if (
      !trimmedName ||
      !trimmedAddress ||
      !editDraft.propertyType ||
      !trimmedZipCode ||
      !trimmedNeighborhood ||
      !tenantId ||
      !editDraft.rentAmount ||
      !editDraft.dueDay ||
      !editDraft.startDate ||
      !editDraft.endDate
    ) {
      setEditError("Todos los campos son obligatorios.")
      return
    }

    if (!/^\d{5}$/.test(trimmedZipCode)) {
      setEditError("El código postal debe tener exactamente 5 dígitos.")
      return
    }

    if (Number.isNaN(dueDay) || (dueDay ?? 0) < 1 || (dueDay ?? 0) > 31) {
      setEditError("El día de pago debe ser un número entre 1 y 31.")
      return
    }

    if (Number.isNaN(rentAmount) || (rentAmount ?? 0) <= 0) {
      setEditError("La renta mensual debe ser mayor a 0.")
      return
    }

    if (new Date(editDraft.endDate) < new Date(editDraft.startDate)) {
      setEditError("La fecha de fin no puede ser anterior al inicio del contrato.")
      return
    }

    setIsSavingPropertyId(property.id)
    setEditError("")
    setErrorMessage("")

    const { error: propertyError } = await supabase
      .from("properties")
      .update({
        name: trimmedName,
        address: trimmedAddress,
        property_type: editDraft.propertyType,
        zip_code: trimmedZipCode,
        neighborhood: trimmedNeighborhood,
      })
      .eq("id", property.id)
      .eq("user_id", currentUserId)

    if (propertyError) {
      setEditError(propertyError.message)
      setIsSavingPropertyId(null)
      return
    }

    const existingActiveLease = activeLeaseByPropertyId.get(property.id)

    const leasePayload = {
      tenant_id: tenantId,
      rent_amount: rentAmount,
      due_day: dueDay,
      start_date: editDraft.startDate || null,
      end_date: editDraft.endDate || null,
      status: tenantId ? "active" : "inactive",
    }

    let activeLeaseId: string | null = existingActiveLease?.id ?? null

    if (existingActiveLease) {
      const { error: leaseUpdateError } = await supabase
        .from("leases")
        .update(leasePayload)
        .eq("id", existingActiveLease.id)
        .eq("user_id", currentUserId)

      if (leaseUpdateError) {
        setEditError(leaseUpdateError.message)
        setIsSavingPropertyId(null)
        return
      }
    } else if (tenantId || rentAmount || dueDay || editDraft.startDate || editDraft.endDate) {
      const { data: insertedLease, error: leaseInsertError } = await supabase
        .from("leases")
        .insert([
          {
            user_id: currentUserId,
            property_id: property.id,
            ...leasePayload,
          },
        ])
        .select("id")
        .single()

      if (leaseInsertError) {
        setEditError(leaseInsertError.message)
        setIsSavingPropertyId(null)
        return
      }

      activeLeaseId = insertedLease?.id ?? null
    }

    if (
      editDraft.currentMonthPaid &&
      activeLeaseId &&
      tenantId &&
      rentAmount
    ) {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      const currentYear = today.getFullYear()

      const alreadyPaid = payments.some(
        (payment) =>
          payment.lease_id === activeLeaseId &&
          payment.period_month === currentMonth &&
          payment.period_year === currentYear
      )

      if (!alreadyPaid) {
        const { error: paymentInsertError } = await supabase
          .from("payments")
          .insert([
            {
              user_id: currentUserId,
              lease_id: activeLeaseId,
              amount: rentAmount,
              payment_date: getTodayDateForInput(),
              payment_method: "efectivo",
              period_month: currentMonth,
              period_year: currentYear,
              notes: "Registrado al iniciar el seguimiento en la app.",
            },
          ])

        if (paymentInsertError) {
          setEditError(paymentInsertError.message)
          setIsSavingPropertyId(null)
          return
        }
      }
    }

    await fetchData()
    setIsSavingPropertyId(null)
    closeEditModal()
  }

  const resetAddPropertyForm = () => {
    setNewName("")
    setNewAddress("")
    setNewPropertyType("")
    setNewZipCode("")
    setNewNeighborhood("")
    setNewOccupantsRange("")
    setCreatePropertyError("")
  }

  const closeAddPropertyModal = () => {
    if (isCreatingProperty) return
    setIsAddPropertyModalOpen(false)
    resetAddPropertyForm()
  }

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUserId) {
      setCreatePropertyError("No se encontró el usuario autenticado.")
      return
    }

    const trimmedName = newName.trim()
    const trimmedAddress = newAddress.trim()
    const trimmedZipCode = newZipCode.trim()
    const trimmedNeighborhood = newNeighborhood.trim()

    if (!trimmedName || !trimmedAddress || !newPropertyType || !trimmedZipCode || !trimmedNeighborhood) {
      setCreatePropertyError("Completa nombre, tipo, dirección, código postal y colonia.")
      return
    }

    if (!/^\d{5}$/.test(trimmedZipCode)) {
      setCreatePropertyError("El código postal debe tener exactamente 5 dígitos.")
      return
    }

    setIsCreatingProperty(true)
    setCreatePropertyError("")

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
      setCreatePropertyError(error.message)
      setIsCreatingProperty(false)
      return
    }

    await fetchData()
    setIsCreatingProperty(false)
    setIsAddPropertyModalOpen(false)
    resetAddPropertyForm()
  }

  const openAddTenantModal = (property: Property) => {
    setSelectedPropertyForTenant(property)
    setTenantName("")
    setTenantSource("")
    setTenantAgeRange("")
    setTenantOccupationType("")
    setTenantDependentsRange("")
    setTenantHasPets("")
    setTenantNotes("")
    setCreateTenantError("")
    setIsAddTenantModalOpen(true)
  }

  const closeAddTenantModal = () => {
    if (isCreatingTenant) return

    setIsAddTenantModalOpen(false)
    setSelectedPropertyForTenant(null)
    setTenantName("")
    setTenantSource("")
    setTenantAgeRange("")
    setTenantOccupationType("")
    setTenantDependentsRange("")
    setTenantHasPets("")
    setTenantNotes("")
    setCreateTenantError("")
  }

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUserId || !selectedPropertyForTenant) {
      setCreateTenantError("No se encontró la propiedad seleccionada.")
      return
    }

    if (!tenantName.trim()) {
      setCreateTenantError("El nombre del inquilino es obligatorio.")
      return
    }

    setIsCreatingTenant(true)
    setCreateTenantError("")

    const { data, error } = await supabase
      .from("tenants")
      .insert([
        {
          name: tenantName.trim(),
          tenant_source: tenantSource || null,
          age_range: tenantAgeRange || null,
          occupation_type: tenantOccupationType || null,
          dependents_range: tenantDependentsRange || null,
          has_pets:
            tenantHasPets === ""
              ? null
              : tenantHasPets === "true",
          notes: tenantNotes.trim() || null,
          user_id: currentUserId,
        },
      ])
      .select("id, name, phone, tenant_source, age_range, occupation_type, dependents_range, has_pets, notes, user_id, created_at")
      .single()

    if (error) {
      setCreateTenantError(error.message)
      setIsCreatingTenant(false)
      return
    }

    const newTenant = data as Tenant

    setTenants((prev) => [newTenant, ...prev])

    if (selectedPropertyForEdit?.id === selectedPropertyForTenant.id) {
      setEditDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tenantId: newTenant.id,
        }
      })
    }

    setIsCreatingTenant(false)
    closeAddTenantModal()
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

    if (!activeLease || !activeLease.tenant_id) {
      setPaymentError("Esta propiedad no tiene un inquilino asignado.")
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
    if (!selectedPropertyForDelete || !currentUserId) return

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
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-wider text-[#213A6B]">
                Mis propiedades
              </h2>
              <p className="text-sm text-muted-foreground">
                Administra la información de cada inmueble.
              </p>
            </div>

            <Button
              onClick={() => setIsAddPropertyModalOpen(true)}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              Agregar propiedad
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando propiedades...</p>
          ) : errorMessage ? (
            <p className="text-sm text-red-600">Error: {errorMessage}</p>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no hay propiedades registradas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => {
                const activeLease = activeLeaseByPropertyId.get(property.id)
                const assignedTenant = activeLease?.tenant_id
                  ? tenantById.get(activeLease.tenant_id)
                  : null
                const summary = getSummaryFor(property.id)
                const paymentBadge = paymentStatusConfig[summary.status]
                const hasContract = summary.status !== "sin_contrato"
                return (
                  <div
                    key={property.id}
                    className="rounded-3xl bg-white px-6 py-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ border: "1.5px solid #94a3b8" }}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: "#E8EEF9" }}
                          >
                            <MapPin
                              size={24}
                              strokeWidth={2}
                              style={{ color: "#213A6B" }}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-xl font-semibold tracking-wider text-[#213A6B] sm:text-[28px]">
                              {property.name || "Sin nombre"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600 sm:text-lg">
                              {property.address || "Sin dirección"}
                              {property.neighborhood ? ` · ${property.neighborhood}` : ""}
                              {property.zip_code ? ` · CP ${property.zip_code}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="mt-6 grid max-w-[1200px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoBox
                              label="Tipo"
                              value={getOptionLabel(propertyTypeOptions, property.property_type)}
                            />

                            <InfoBox
                              label="Inquilino"
                              value={assignedTenant?.name || "Sin inquilino"}
                            />

                            <InfoBox
                              label="Renta mensual"
                              value={formatCurrency(activeLease?.rent_amount)}
                            />

                            <InfoBox
                              label="Fecha de pago"
                              value={activeLease?.due_day ? `Día ${activeLease.due_day}` : "Sin definir"}
                            />

                            <InfoBox
                              label="Pagado hasta"
                              value={hasContract ? summary.paidUntilLabel : "Sin contrato"}
                            />

                            <InfoBox
                              label={hasContract ? summary.balanceLabel : "Adeudo"}
                              value={hasContract ? formatCurrency(summary.balanceAmount) : "—"}
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                assignedTenant
                                  ? "border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                  : "border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                              }
                            >
                              {assignedTenant ? "Activa" : "Disponible"}
                            </Badge>

                            <Badge
                              variant="outline"
                              className={`${paymentBadge.className} px-3 py-1 text-sm font-medium`}
                            >
                              {paymentBadge.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => openEdit(property)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => openPaymentModal(property)}
                        >
                          <CreditCard className="h-4 w-4" />
                          Registrar pago
                        </Button>

                        <Button
                          variant="outline"
                          className="gap-2 border-red-200 text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => openDeleteModal(property)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isAddPropertyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <ModalHeader
              title="Agregar propiedad"
              description="Completa los datos básicos del inmueble."
              onClose={closeAddPropertyModal}
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
                    onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
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

              {createPropertyError ? (
                <p className="text-sm text-red-600">Error: {createPropertyError}</p>
              ) : null}

              <ModalFooter
                onCancel={closeAddPropertyModal}
                disabled={isCreatingProperty}
                submitLabel={isCreatingProperty ? "Guardando..." : "Guardar propiedad"}
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
              description={selectedPropertyForPayment?.name || "Propiedad seleccionada"}
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

              <div className="col-span-2">
                <Field label="Notas del pago">
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className={`${inputClass()} min-h-[100px] resize-none`}
                    placeholder="Opcional. Ej. Pago parcial, adelanto, transferencia pendiente de validar..."
                  />
                </Field>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                La fecha de pago se guarda como historial. El estatus del pago se calcula con base en el mes de renta que selecciones.
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
                  {isDeletingPropertyId ? "Eliminando..." : "Eliminar propiedad"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen &&
        selectedPropertyForEdit &&
        editDraft &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4">
            <div className="relative z-[1201] flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <ModalHeader
                title="Editar propiedad"
                description={selectedPropertyForEdit.name || "Propiedad seleccionada"}
                onClose={closeEditModal}
              />

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-4">
                    <SectionTitle
                      title="Datos de la propiedad"
                      description="Información física del inmueble."
                    />

                    <Field label="Nombre" required>
                      <input
                        value={editDraft.name}
                        onChange={(e) => handleDraftChange("name", e.target.value)}
                        className={inputClass()}
                        placeholder="Nombre"
                        required
                      />
                    </Field>

                    <Field label="Tipo de propiedad" required>
                      <select
                        value={editDraft.propertyType}
                        onChange={(e) => handleDraftChange("propertyType", e.target.value)}
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

                    <Field label="Dirección" required>
                      <input
                        value={editDraft.address}
                        onChange={(e) => handleDraftChange("address", e.target.value)}
                        className={inputClass()}
                        placeholder="Dirección"
                        required
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Código postal" required>
                        <input
                          value={editDraft.zipCode}
                          onChange={(e) =>
                            handleDraftChange(
                              "zipCode",
                              e.target.value.replace(/\D/g, "").slice(0, 5)
                            )
                          }
                          className={inputClass()}
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="Ej. 44600"
                          required
                        />
                      </Field>

                      <Field label="Colonia" required>
                        <input
                          value={editDraft.neighborhood}
                          onChange={(e) =>
                            handleDraftChange("neighborhood", e.target.value)
                          }
                          className={inputClass()}
                          placeholder="Colonia"
                          required
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle
                      title="Contrato"
                      description="Datos del inquilino, renta y fechas del contrato."
                    />

                    <Field label="Inquilino" required>
                      <div className="flex gap-2">
                        <select
                          value={editDraft.tenantId}
                          onChange={(e) =>
                            handleDraftChange("tenantId", e.target.value)
                          }
                          className={inputClass()}
                          required
                        >
                          <option value="">Seleccionar inquilino</option>
                          {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name || "Sin nombre"}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0 gap-2"
                          onClick={() => openAddTenantModal(selectedPropertyForEdit)}
                        >
                          <Plus className="h-4 w-4" />
                          Nuevo
                        </Button>
                      </div>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Renta mensual" required>
                        <input
                          type="number"
                          value={editDraft.rentAmount}
                          onChange={(e) =>
                            handleDraftChange("rentAmount", e.target.value)
                          }
                          className={inputClass()}
                          placeholder="Ej. 12000"
                          required
                        />
                      </Field>

                      <Field label="Día de pago" required>
                        <input
                          type="number"
                          value={editDraft.dueDay}
                          onChange={(e) =>
                            handleDraftChange("dueDay", e.target.value)
                          }
                          className={inputClass()}
                          placeholder="1 a 31"
                          min="1"
                          max="31"
                          required
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Inicio de contrato" required>
                        <input
                          type="date"
                          value={editDraft.startDate}
                          onChange={(e) =>
                            handleDraftChange("startDate", e.target.value)
                          }
                          className={inputClass()}
                          required
                        />
                      </Field>

                      <Field label="Fin de contrato" required>
                        <input
                          type="date"
                          value={editDraft.endDate}
                          onChange={(e) =>
                            handleDraftChange("endDate", e.target.value)
                          }
                          className={inputClass()}
                          required
                        />
                      </Field>
                    </div>

                    {editDraft.tenantId &&
                      editDraft.rentAmount &&
                      !activeLeaseByPropertyId.get(selectedPropertyForEdit.id) ? (
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                        <p className="font-medium">
                          ¿El inquilino ya pagó el mes en curso?
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="currentMonthPaid"
                              checked={editDraft.currentMonthPaid === true}
                              onChange={() =>
                                setEditDraft((prev) =>
                                  prev ? { ...prev, currentMonthPaid: true } : prev
                                )
                              }
                            />
                            <span>Sí, registrar pago del mes actual</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="currentMonthPaid"
                              checked={editDraft.currentMonthPaid === false}
                              onChange={() =>
                                setEditDraft((prev) =>
                                  prev ? { ...prev, currentMonthPaid: false } : prev
                                )
                              }
                            />
                            <span>No, dejar como pendiente</span>
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Si eliges Sí, se registrará automáticamente el pago del mes en curso con la fecha de hoy.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {editError ? (
                  <p className="mt-5 text-sm text-red-600">Error: {editError}</p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={Boolean(isSavingPropertyId)}
                >
                  Cancelar
                </Button>

                <Button
                  onClick={() => handleSaveProperty(selectedPropertyForEdit)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={
                    Boolean(isSavingPropertyId) ||
                    !editDraft.name.trim() ||
                    !editDraft.propertyType ||
                    !editDraft.address.trim() ||
                    !editDraft.zipCode.trim() ||
                    !editDraft.neighborhood.trim() ||
                    !editDraft.tenantId ||
                    !editDraft.rentAmount ||
                    !editDraft.dueDay ||
                    !editDraft.startDate ||
                    !editDraft.endDate
                  }
                >
                  {isSavingPropertyId ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isAddTenantModalOpen &&
        selectedPropertyForTenant &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-4">
            <div className="relative z-[1301] flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <ModalHeader
                title="Agregar inquilino"
                description={selectedPropertyForTenant.name || "Propiedad seleccionada"}
                onClose={closeAddTenantModal}
              />

              <form onSubmit={handleCreateTenant} className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Alias">
                    <input
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className={inputClass()}
                      placeholder="Ej. Luis Inquilino"
                      required
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border bg-slate-50/60 p-4">
                  <SectionTitle
                    title="Información adicional (OPCIONAL)"
                    description="Ayuda a tener mejor contexto del perfil del inquilino."
                  />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="¿Cómo conociste al inquilino?">
                      <select
                        value={tenantSource}
                        onChange={(e) => setTenantSource(e.target.value)}
                        className={inputClass()}
                      >
                        <option value="">Seleccionar</option>
                        {tenantSourceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Edad">
                      <select
                        value={tenantAgeRange}
                        onChange={(e) => setTenantAgeRange(e.target.value)}
                        className={inputClass()}
                      >
                        <option value="">Seleccionar</option>
                        {ageRangeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Ocupación">
                      <select
                        value={tenantOccupationType}
                        onChange={(e) => setTenantOccupationType(e.target.value)}
                        className={inputClass()}
                      >
                        <option value="">Seleccionar</option>
                        {occupationTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Número de inquilinos">
                      <select
                        value={tenantDependentsRange}
                        onChange={(e) => setTenantDependentsRange(e.target.value)}
                        className={inputClass()}
                      >
                        <option value="">Seleccionar</option>
                        {dependentsRangeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Mascotas">
                      <select
                        value={tenantHasPets}
                        onChange={(e) => setTenantHasPets(e.target.value)}
                        className={inputClass()}
                      >
                        <option value="">Seleccionar</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Notas adicionales">
                        <textarea
                          value={tenantNotes}
                          onChange={(e) => setTenantNotes(e.target.value)}
                          className={`${inputClass()} min-h-[100px] resize-none`}
                          placeholder="Ej. Siempre paga tarde pero avisa / Tiene negocio propio informal / Vive con familia..."
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {createTenantError ? (
                  <p className="text-sm text-red-600">Error: {createTenantError}</p>
                ) : null}

                <ModalFooter
                  onCancel={closeAddTenantModal}
                  disabled={isCreatingTenant}
                  submitLabel={isCreatingTenant ? "Guardando..." : "Guardar inquilino"}
                />
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  )
}

function Field({
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

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#213A6B] focus:ring-2 focus:ring-[#213A6B]/15"
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold tracking-wider text-foreground">
        {title}
      </h4>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
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
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
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
