"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, FileText, Users, Calendar, ChevronDown } from "lucide-react"

interface ExportPopoverProps {
  exportToExcel: () => void
  exportToPDF: () => void
  openStationModal: () => void
  openBuyerModal: () => void
  openSalesDateModal: () => void
<<<<<<< HEAD:app/components/inventory/export-popover.tsx
  openStationSummaryModal: () => void
=======
  openStationSummaryModal: () => void // Add this line
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/export-popover.tsx
}

export function ExportPopover({
  exportToExcel,
  exportToPDF,
  openStationModal,
  openBuyerModal,
  openSalesDateModal,
<<<<<<< HEAD:app/components/inventory/export-popover.tsx
  openStationSummaryModal,
=======
  openStationSummaryModal, // Add this line
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/export-popover.tsx
}: ExportPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export Options</span>
          <span className="sm:hidden">Export</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-700 border-b">Export Options</div>

          <Button onClick={exportToExcel} variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
            <Download className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Export CSV</div>
              <div className="text-xs text-gray-500">Download filtered data as CSV</div>
            </div>
          </Button>

          <Button onClick={exportToPDF} variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
            <FileText className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Export PDF</div>
              <div className="text-xs text-gray-500">Current filtered data summary</div>
            </div>
          </Button>

          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-b">Summary Reports</div>

          <Button
            onClick={openStationSummaryModal}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-2"
          >
            <FileText className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Summary by Station</div>
              <div className="text-xs text-gray-500">All stations by date & type</div>
            </div>
          </Button>

          <Button onClick={openStationModal} variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
            <FileText className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">By Station</div>
              <div className="text-xs text-gray-500">Sales summary per station</div>
            </div>
          </Button>

          <Button onClick={openBuyerModal} variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
            <Users className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">By Buyer</div>
              <div className="text-xs text-gray-500">Sales summary per buyer</div>
            </div>
          </Button>

          <Button onClick={openSalesDateModal} variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
            <Calendar className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">By Date Range</div>
              <div className="text-xs text-gray-500">Daily sales summary</div>
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
