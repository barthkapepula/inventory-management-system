"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SalesDateReportFilters {
  dateFrom: string
  dateTo: string
  tobaccoType: string
  stationId: string
  reportType: string // New field for report type
}

interface SalesDateModalProps {
  isOpen: boolean
  onClose: () => void
  filters: SalesDateReportFilters
  setFilters: (filters: SalesDateReportFilters) => void
  onExport: () => void
  uniqueTobaccoTypes: string[]
  uniqueStationIds: string[]
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

  const handleClose = () => {
    onClose()
    setFilters({ 
      dateFrom: "", 
      dateTo: "", 
      tobaccoType: "", 
      stationId: "",
      reportType: "daily" 
    })
  }

  const getReportDescription = () => {
    switch (filters.reportType) {
      case "daily":
        return "This report will show daily sales summaries for the selected station and date range, including total bales, weight, and value per day."
      case "monthly":
        return "This report will show monthly sales summaries for the selected station and date range, including total bales, weight, and value per month."
      case "yearly":
        return "This report will show yearly sales summaries for the selected station and date range, including total bales, weight, and value per year."
      default:
        return "This report will show sales summaries for the selected criteria."
    }
  }

  const getReportTitle = () => {
    switch (filters.reportType) {
      case "daily":
        return "Export Daily Sales Summary"
      case "monthly":
        return "Export Monthly Sales Summary"
      case "yearly":
        return "Export Yearly Sales Summary"
      default:
        return "Export Sales Summary by Date Range"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{getReportTitle()}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type *</label>
            <Select
              value={filters.reportType}
              onValueChange={(value) => setFilters({ ...filters, reportType: value })}
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
          </div>

          <div>
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
              value={filters.tobaccoType}
              onValueChange={(value) => setFilters({ ...filters, tobaccoType: value === "all" ? "" : value })}
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
            <label className="text-sm font-medium mb-2 block">Station ID (Optional)</label>
            <Select
              value={filters.stationId}
              onValueChange={(value) => setFilters({ ...filters, stationId: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {uniqueStationIds.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Note:</strong> {getReportDescription()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            onClick={onExport}
            className="flex-1"
            disabled={!filters.dateFrom || !filters.dateTo || !filters.reportType}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={handleClose}
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
