import { Button } from "@/app/components/ui/button"
import { Download, FileText } from "lucide-react"

interface InventoryHeaderProps {
  onExportCSV: () => void
  onExportPDF: () => void
  onShowStationModal: () => void
}

export function InventoryHeader({ onExportCSV, onExportPDF, onShowStationModal }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-700">EASTERN TOBACCO ASSOCIATION</h2>
        <h1 className="text-3xl font-bold text-gray-900">Tobacco Inventory Management</h1>
        <p className="text-gray-600">Manage and track tobacco inventory records</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onExportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={onExportPDF} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button onClick={onShowStationModal} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export Summarized Report per Station
        </Button>
      </div>
    </div>
  )
}
