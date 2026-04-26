import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PropertiesTable } from "@/components/dashboard/properties-table"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader
        title="Dashboard"
        description="Bienvenido de vuelta"
      />

      <div className="p-6 space-y-6">
        <StatsCards />
        <PropertiesTable />
      </div>
    </div>
  )
}