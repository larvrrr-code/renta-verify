import { PropertiesHeader } from "@/components/properties/header"
import { PropertiesManagement } from "@/components/properties/properties-management"

export default function PropiedadesPage() {
  return (
    <>
      <PropertiesHeader />
      <div className="p-6 pt-4">
        <PropertiesManagement />
      </div>
    </>
  )
}