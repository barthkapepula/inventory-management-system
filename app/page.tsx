"use client"

import { useState } from "react"
import {
  InventoryHeader,
  StatsCards,
  InventoryFilters,
  InventoryTable,
  InventoryPagination,
  StationModal,
  LoadingSpinner,
  ErrorDisplay,
  useInventoryData,
  exportToCSV,
  exportToPDF,
  exportStationSummaryPDF,
  VisibleColumns,
  StationReportFilters,
} from "./components/inventory"

const ITEMS_PER_PAGE = 10

export default function TobaccoInventoryDashboard() {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    filteredAndSortedData,
    paginatedData,
    totalPages,
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

  const [showStationModal, setShowStationModal] = useState(false)
  const [stationReportFilters, setStationReportFilters] = useState<StationReportFilters>({
    stationId: "",
    dateFrom: "",
    dateTo: "",
  })

  const handleExportCSV = () => exportToCSV(filteredAndSortedData)
  const handleExportPDF = () => exportToPDF(filteredAndSortedData, filters)
  const handleExportStationSummary = () => {
    exportStationSummaryPDF(data, stationReportFilters)
    setShowStationModal(false)
  }

  if (loading) return <LoadingSpinner message="Loading inventory data..." />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="container mx-auto p-4 space-y-6">
      <InventoryHeader
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onShowStationModal={() => setShowStationModal(true)}
      />

      <StatsCards
        data={data}
        filteredCount={filteredAndSortedData.length}
        uniqueFarmersCount={uniqueFarmerIds.length}
      />

      <InventoryFilters
        filters={filters}
        setFilters={setFilters}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        uniqueFarmerIds={uniqueFarmerIds}
        uniqueBuyerIds={uniqueBuyerIds}
        uniqueTobaccoTypes={uniqueTobaccoTypes}
        uniqueStationIds={uniqueStationIds}
      />

      <InventoryTable
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        visibleColumns={visibleColumns}
      />

      <InventoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAndSortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Station Summary Modal */}
      <StationModal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        filters={stationReportFilters}
        setFilters={setStationReportFilters}
        uniqueStationIds={uniqueStationIds}
        onExport={handleExportStationSummary}
      />
    </div>
  )
}
