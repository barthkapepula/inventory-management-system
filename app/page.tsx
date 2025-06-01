"use client"

import { useState } from "react"
import { 
  InventoryHeader, 
  InventoryFilters, 
  InventoryTable, 
  InventoryPagination,
  StatsCards,
  LoadingSpinner,
  ErrorDisplay,
  StationModal,
  useInventoryData,
  exportToCSV,
  exportSalesSummaryByDatePDF,
  exportSalesSummaryByStationPDF,
  exportSalesSummaryByBuyerPDF,
  exportSalesSummaryByDateRangePDF,
  type DateRangeFilters,
  type StationSummaryFilters,
  type StationReportFilters,
  type BuyerReportFilters,
  type DateBasedReportFilters,
  type VisibleColumns
} from "./components/inventory"
import { SalesDateModal } from "./components/inventory/sales-date-modal"
import { StationSummaryModal } from "./components/inventory/station-summary-modal"
import { BuyerModal } from "./components/inventory/buyer-modal"

interface SalesDateReportFilters {
  dateFrom: string
  dateTo: string
  tobaccoType: string
  stationId: string
  reportType: string
}

export default function InventoryPage() {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    uniqueFarmerIds,
    uniqueBuyerIds,
    uniqueTobaccoTypes,
    uniqueStationIds,
  } = useInventoryData()

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    barcodeId: true,
    weight: true,
    farmerId: true,
    stationId: true,
    buyerId: true,
    registra: true,
    lotNumber: true,
    grade: true,
    price: true,
    tobaccoType: true,
    dateFormated: true,
    dispatchId: true,
  })

  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal states
  const [isStationModalOpen, setIsStationModalOpen] = useState(false)
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false)
  const [isSalesDateModalOpen, setIsSalesDateModalOpen] = useState(false)
  const [isStationSummaryModalOpen, setIsStationSummaryModalOpen] = useState(false)

  // Filter states for modals
  const [stationReportFilters, setStationReportFilters] = useState<StationReportFilters>({
    stationId: "",
    dateFrom: "",
    dateTo: "",
  })

  const [buyerReportFilters, setBuyerReportFilters] = useState<BuyerReportFilters>({
    stationId: undefined,
    tobaccoType: undefined,
    dateFrom: "",
    dateTo: "",
  })

  const [salesDateFilters, setSalesDateFilters] = useState<DateBasedReportFilters>({
    dateFrom: "",
    dateTo: "",
    tobaccoType: undefined,
    stationId: undefined,
    reportType: "daily",
  })

  const [stationSummaryFilters, setStationSummaryFilters] = useState<StationSummaryFilters>({
    dateFrom: "",
    dateTo: "",
    tobaccoType: "",
  })

  // Apply filters to get filtered data
  const filteredData = data.filter((item) => {
    const matchesFarmerId = !filters.farmerId || item.farmerId.toLowerCase().includes(filters.farmerId.toLowerCase())
    const matchesBuyerId = !filters.buyerId || item.buyerId.toLowerCase().includes(filters.buyerId.toLowerCase())
    const matchesTobaccoType = !filters.tobaccoType || item.tobaccoType === filters.tobaccoType
    const matchesStationId = !filters.stationId || item.stationId === filters.stationId
    const matchesSearch = !filters.search || 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(filters.search.toLowerCase())
      )

    let matchesDateRange = true
    if (filters.dateFrom || filters.dateTo) {
      const itemDate = new Date(item.date)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        matchesDateRange = matchesDateRange && itemDate >= fromDate
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        matchesDateRange = matchesDateRange && itemDate <= toDate
      }
    }

    return matchesFarmerId && matchesBuyerId && matchesTobaccoType && matchesStationId && matchesSearch && matchesDateRange
  })

  // Calculate unique farmers count from filtered data
  const uniqueFarmersInFilteredData = new Set(filteredData.map(item => item.farmerId)).size

  // Export functions
  const handleExportToExcel = () => {
    exportToCSV(filteredData)
  }

  const handleExportToPDF = () => {
    const dateRangeFilters: DateRangeFilters = {
      dateFrom: filters.dateFrom || "",
      dateTo: filters.dateTo || "",
      stationId: filters.stationId,
      tobaccoType: filters.tobaccoType
    }
    exportSalesSummaryByDatePDF(filteredData, dateRangeFilters)
  }

  const handleSalesDateExport = () => {
    const dateBasedFilters: DateBasedReportFilters = {
      dateFrom: salesDateFilters.dateFrom,
      dateTo: salesDateFilters.dateTo,
      stationId: salesDateFilters.stationId,
      tobaccoType: salesDateFilters.tobaccoType,
      reportType: salesDateFilters.reportType as 'daily' | 'monthly' | 'yearly'
    }
    exportSalesSummaryByDateRangePDF(data, dateBasedFilters)
    setIsSalesDateModalOpen(false)
  }

  const handleStationSummaryExport = () => {
    exportSalesSummaryByStationPDF(filteredData, stationSummaryFilters)
    setIsStationSummaryModalOpen(false)
  }

  const handleBuyerExport = () => {
    exportSalesSummaryByBuyerPDF(data, buyerReportFilters)
    setIsBuyerModalOpen(false)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader
          exportToExcel={handleExportToExcel}
          exportToPDF={handleExportToPDF}
          openStationModal={() => setIsStationModalOpen(true)}
          openBuyerModal={() => setIsBuyerModalOpen(true)}
          openSalesDateModal={() => setIsSalesDateModalOpen(true)}
          openStationSummaryModal={() => setIsStationSummaryModalOpen(true)}
        />

        <StatsCards 
          data={data}
          filteredCount={filteredData.length}
          uniqueFarmersCount={uniqueFarmersInFilteredData}
        />

        <InventoryFilters
          filters={filters}
          setFilters={setFilters}
          uniqueFarmerIds={uniqueFarmerIds}
          uniqueBuyerIds={uniqueBuyerIds}
          uniqueTobaccoTypes={uniqueTobaccoTypes}
          uniqueStationIds={uniqueStationIds}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />

        <InventoryTable
          data={paginatedData}
          visibleColumns={visibleColumns}
          sortConfig={{ key: null, direction: "asc" }}
          onSort={() => {}}
        />

        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Modals */}
        <StationModal
          isOpen={isStationModalOpen}
          onClose={() => setIsStationModalOpen(false)}
          filters={stationReportFilters}
          setFilters={setStationReportFilters}
          onExport={() => {
            // Handle station export here if needed
            setIsStationModalOpen(false)
          }}
          uniqueStationIds={uniqueStationIds}
        />

        <BuyerModal
          isOpen={isBuyerModalOpen}
          onClose={() => setIsBuyerModalOpen(false)}
          filters={buyerReportFilters}
          setFilters={setBuyerReportFilters}
          onExport={handleBuyerExport}
          uniqueTobaccoTypes={uniqueTobaccoTypes}
          uniqueStationIds={uniqueStationIds}
        />

        <SalesDateModal
          isOpen={isSalesDateModalOpen}
          onClose={() => setIsSalesDateModalOpen(false)}
          filters={salesDateFilters}
          setFilters={setSalesDateFilters}
          onExport={handleSalesDateExport}
          uniqueTobaccoTypes={uniqueTobaccoTypes}
          uniqueStationIds={uniqueStationIds}
        />

        <StationSummaryModal
          isOpen={isStationSummaryModalOpen}
          onClose={() => setIsStationSummaryModalOpen(false)}
          filters={stationSummaryFilters}
          setFilters={setStationSummaryFilters}
          onExport={handleStationSummaryExport}
          uniqueTobaccoTypes={uniqueTobaccoTypes}
        />
      </div>
    </div>
  )
}
