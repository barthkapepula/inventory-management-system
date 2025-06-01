"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
import { DateBasedReportFilters } from "./types"
=======

interface SalesDateReportFilters {
  dateFrom: string
  dateTo: string
  tobaccoType: string
  stationId: string // Add this field
}
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx

interface SalesDateModalProps {
  isOpen: boolean
  onClose: () => void
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
  filters: DateBasedReportFilters
  setFilters: (filters: DateBasedReportFilters) => void
  onExport: () => void
  uniqueTobaccoTypes: string[]
  uniqueStationIds: string[]
=======
  filters: SalesDateReportFilters
  setFilters: (filters: SalesDateReportFilters) => void
  onExport: () => void
  uniqueTobaccoTypes: string[]
  uniqueStationIds: string[] // Add this prop
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
}

export function SalesDateModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  onExport,
  uniqueTobaccoTypes,
  uniqueStationIds,
}: SalesDateModalProps) {
  if (!isOpen) return null

<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
  const handleClose = () => {
    onClose()
    setFilters({ 
      dateFrom: "", 
      dateTo: "", 
      tobaccoType: undefined, 
      stationId: undefined, 
      reportType: "daily" 
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Export Sales Summary - {filters.reportType === 'daily' ? 'Daily' : 
                                 filters.reportType === 'monthly' ? 'Monthly' : 'Yearly'} Report
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type *</label>
            <Select
              value={filters.reportType}
              onValueChange={(value) => setFilters({ ...filters, reportType: value as 'daily' | 'monthly' | 'yearly' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="yearly">Yearly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {filters.reportType === 'daily' && "Shows sales data grouped by individual dates"}
              {filters.reportType === 'monthly' && "Shows sales data grouped by month and year"}
              {filters.reportType === 'yearly' && "Shows sales data grouped by year"}
            </p>
          </div>

          <div>
=======
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Export Sales Summary by Date Range</h2>

        <div className="space-y-4">
          <div>
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
            <label className="text-sm font-medium mb-2 block">Date From *</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date To *</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tobacco Type (Optional)</label>
            <Select
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
              value={filters.tobaccoType || ""}
              onValueChange={(value) => setFilters({ ...filters, tobaccoType: value === "all" ? undefined : value })}
=======
              value={filters.tobaccoType}
              onValueChange={(value) => setFilters({ ...filters, tobaccoType: value === "all" ? "" : value })}
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTobaccoTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
            <label className="text-sm font-medium mb-2 block">Station ID (Optional)</label>
            <Select
              value={filters.stationId || ""}
              onValueChange={(value) => setFilters({ ...filters, stationId: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
=======
            <label className="text-sm font-medium mb-2 block">Station ID *</label>
            <Select
              value={filters.stationId}
              onValueChange={(value) => setFilters({ ...filters, stationId: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
                {uniqueStationIds.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
            <strong>Note:</strong> This report will show {filters.reportType} sales summaries for the selected date range,
            including total bales, weight, and value per {filters.reportType === 'daily' ? 'day' : 
                                                         filters.reportType === 'monthly' ? 'month' : 'year'}.
=======
            <strong>Note:</strong> This report will show daily sales summaries for the selected station and date range,
            including total bales, weight, and value per day.
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            onClick={onExport}
            className="flex-1"
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
            disabled={!filters.dateFrom || !filters.dateTo || !filters.reportType}
=======
            disabled={!filters.dateFrom || !filters.dateTo || !filters.stationId}
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
<<<<<<< HEAD:app/components/inventory/sales-date-modal.tsx
            onClick={handleClose}
=======
            onClick={() => {
              onClose()
              setFilters({ dateFrom: "", dateTo: "", tobaccoType: "", stationId: "" })
            }}
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/sales-date-modal.tsx
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
