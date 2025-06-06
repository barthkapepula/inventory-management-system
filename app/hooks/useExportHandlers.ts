import { useCallback } from 'react'
import {
  exportToCSV,
  exportSalesSummaryByDatePDF,
  exportSalesSummaryByStationPDF,
  exportSalesSummaryByBuyerPDF,
  exportSalesSummaryByDateRangePDF,
  type DateRangeFilters,
  type DateBasedReportFilters
} from '../components/inventory'
import type { InventoryItem } from '../types/inventory' // Import from centralized types
import type { useFilterStates } from './useFilterStates'
import type { useModalStates } from './useModalStates'

interface Filters {
  dateFrom?: string
  dateTo?: string
  stationId?: string
  tobaccoType?: string
}

export function useExportHandlers(
  data: InventoryItem[],
  filteredData: InventoryItem[],
  filters: Filters,
  filterStates: ReturnType<typeof useFilterStates>,
  modalStates: ReturnType<typeof useModalStates>
) {
  const handleExportToExcel = useCallback(() => {
    exportToCSV(filteredData)
  }, [filteredData])

  const handleExportToPDF = useCallback(() => {
    const dateRangeFilters: DateRangeFilters = {
      dateFrom: filters.dateFrom || "",
      dateTo: filters.dateTo || "",
      stationId: filters.stationId,
      tobaccoType: filters.tobaccoType
    }
    exportSalesSummaryByDatePDF(filteredData, dateRangeFilters)
  }, [filteredData, filters])

  const handleSalesDateExport = useCallback(() => {
    const dateBasedFilters: DateBasedReportFilters = {
      dateFrom: filterStates.salesDateFilters.dateFrom,
      dateTo: filterStates.salesDateFilters.dateTo,
      stationId: filterStates.salesDateFilters.stationId,
      tobaccoType: filterStates.salesDateFilters.tobaccoType,
      reportType: filterStates.salesDateFilters.reportType as 'daily' | 'monthly' | 'yearly'
    }
    exportSalesSummaryByDateRangePDF(data, dateBasedFilters)
    modalStates.closeSalesDateModal()
  }, [data, filterStates.salesDateFilters, modalStates])

  const handleStationSummaryExport = useCallback(() => {
    exportSalesSummaryByStationPDF(filteredData, filterStates.stationSummaryFilters)
    modalStates.closeStationSummaryModal()
  }, [filteredData, filterStates.stationSummaryFilters, modalStates])

  const handleBuyerExport = useCallback(() => {
    exportSalesSummaryByBuyerPDF(data, filterStates.buyerReportFilters)
    modalStates.closeBuyerModal()
  }, [data, filterStates.buyerReportFilters, modalStates])

  const handleStationExport = useCallback(() => {
    modalStates.closeStationModal()
  }, [modalStates])

  return {
    handleExportToExcel,
    handleExportToPDF,
    handleSalesDateExport,
    handleStationSummaryExport,
    handleBuyerExport,
    handleStationExport,
  }
}