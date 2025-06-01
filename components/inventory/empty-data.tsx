import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function InventoryEmptyData() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p>No tobacco inventory records were found in the system.</p>
            <p className="text-sm mt-2">Please check your data source or try again later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
