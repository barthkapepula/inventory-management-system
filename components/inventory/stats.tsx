import { Card, CardContent } from "@/components/ui/card"
import type { InventoryItem } from "@/types/inventory"

interface StatsProps {
  data: InventoryItem[]
  filteredCount: number
  uniqueFarmerIds: string[]
}

export function InventoryStats({ data, filteredCount, uniqueFarmerIds }: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-xl sm:text-2xl font-bold">{data.length}</div>
          <p className="text-xs sm:text-sm text-gray-600">Total Records</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-xl sm:text-2xl font-bold">{filteredCount}</div>
          <p className="text-xs sm:text-sm text-gray-600">Filtered Results</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-xl sm:text-2xl font-bold">{uniqueFarmerIds.length}</div>
          <p className="text-xs sm:text-sm text-gray-600">Unique Farmers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-xl sm:text-2xl font-bold">
            {data.filter((item) => Number.parseFloat(item.price || "0") > 0).length}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Records with Price</p>
        </CardContent>
      </Card>
    </div>
  )
}
