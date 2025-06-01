import { Card, CardContent } from "@/app/components/ui/card"
import { InventoryItem } from "./types"

interface StatsCardsProps {
  data: InventoryItem[]
  filteredCount: number
  uniqueFarmersCount: number
}

export function StatsCards({ data, filteredCount, uniqueFarmersCount }: StatsCardsProps) {
  const recordsWithPrice = data ? data.filter((item) => Number.parseFloat(item.price || "0") > 0).length : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{data?.length || 0}</div>
          <p className="text-sm text-gray-600">Total Records</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{filteredCount}</div>
          <p className="text-sm text-gray-600">Filtered Results</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{uniqueFarmersCount}</div>
          <p className="text-sm text-gray-600">Unique Farmers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{recordsWithPrice}</div>
          <p className="text-sm text-gray-600">Records with Price</p>
        </CardContent>
      </Card>
    </div>
  )
}
