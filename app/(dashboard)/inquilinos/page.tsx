import { DashboardHeader } from "@/components/dashboard/header"
import { TenantsManagement } from "@/components/tenants/tenants-management"

export default function InquilinosPage() {
  return (
    <>
      <DashboardHeader
        title="Inquilinos"
        description="Listado de inquilinos y estado de sus pagos."
      />
      <div className="p-6 pt-4">
        <TenantsManagement />
      </div>
    </>
  )
}
