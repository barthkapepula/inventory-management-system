"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import { 
  InventoryHeader, 
  InventoryFilters, 
  InventoryTable, 
  InventoryPagination,
  StatsCards,
  LoadingSpinner,
  StationModal,
  useInventoryData,
  type VisibleColumns,
  FarmerSummaryModal
} from "./components/inventory"
import { SalesDateModal } from "./components/inventory/sales-date-modal"
import { StationSummaryModal } from "./components/inventory/station-summary-modal"
import { BuyerModal } from "./components/inventory/buyer-modal"
import { useModalStates } from "./hooks/useModalStates"
import { useFilterStates } from "./hooks/useFilterStates"
import { useDataFiltering } from "./hooks/useDataFiltering"
import { useExportHandlers } from "./hooks/useExportHandlers"
import { INITIAL_VISIBLE_COLUMNS, DEFAULT_ITEMS_PER_PAGE, SORT_CONFIG } from "./constants/inventory"

const ErrorDisplay = dynamic(
  () => import('./components/inventory/ErrorDisplay').then((mod) => mod.ErrorDisplay),
  { ssr: false }
)

export default function InventoryPage() {
  // Data and core state
  const inventoryData = useInventoryData()
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(INITIAL_VISIBLE_COLUMNS)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)

  // Custom hooks for state management
  const modalStates = useModalStates()
  const filterStates = useFilterStates()
  const filteredData = useDataFiltering(inventoryData.data, inventoryData.filters)
  const exportHandlers = useExportHandlers(
    inventoryData.data,
    filteredData,
    inventoryData.filters,
    filterStates,
    modalStates
  )

  // Derived values
  const uniqueFarmersInFilteredData = new Set(filteredData.map(item => item.farmerId)).size

  // Early returns for loading and error states
  if (inventoryData.loading) return <LoadingSpinner />
  if (inventoryData.error) return <ErrorDisplay message={inventoryData.error} />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader
          exportToExcel={exportHandlers.handleExportToExcel}
          exportToPDF={exportHandlers.handleExportToPDF}
          openStationModal={modalStates.openStationModal}
          openBuyerModal={modalStates.openBuyerModal}
          openSalesDateModal={modalStates.openSalesDateModal}
          openStationSummaryModal={modalStates.openStationSummaryModal}
          openFarmerModal={modalStates.openFarmerModal}
        />

        <StatsCards 
          data={inventoryData.data}
          filteredCount={filteredData.length}
          uniqueFarmersCount={uniqueFarmersInFilteredData}
        />

        <InventoryFilters
          filters={inventoryData.filters}
          setFilters={inventoryData.setFilters}
          uniqueFarmerIds={inventoryData.uniqueFarmerIds}
          uniqueBuyerIds={inventoryData.uniqueBuyerIds}
          uniqueTobaccoTypes={inventoryData.uniqueTobaccoTypes}
          uniqueStationIds={inventoryData.uniqueStationIds}
          uniqueRegistras={inventoryData.uniqueRegistras}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />

        <InventoryTable
          data={inventoryData.paginatedData}
          visibleColumns={visibleColumns}
          sortConfig={SORT_CONFIG}
          onSort={() => {}}
        />

        <InventoryPagination
          currentPage={inventoryData.currentPage}
          totalPages={inventoryData.totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={inventoryData.setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        <ModalComponents
          modalStates={modalStates}
          filterStates={filterStates}
          exportHandlers={exportHandlers}
          inventoryData={inventoryData}
        />
      </div>
    </div>
  )
}

// Separate component for all modals to reduce main component complexity
interface ModalComponentsProps {
  modalStates: ReturnType<typeof useModalStates>
  filterStates: ReturnType<typeof useFilterStates>
  exportHandlers: ReturnType<typeof useExportHandlers>
  inventoryData: ReturnType<typeof useInventoryData>
}

function ModalComponents({ 
  modalStates, 
  filterStates, 
  exportHandlers, 
  inventoryData 
}: ModalComponentsProps) {
  return (
    <>
      <StationModal
        isOpen={modalStates.isStationModalOpen}
        onClose={modalStates.closeStationModal}
        filters={filterStates.stationReportFilters}
        setFilters={filterStates.setStationReportFilters}
        onExport={modalStates.closeStationModal}
        uniqueStationIds={inventoryData.uniqueStationIds}
      />

      <BuyerModal
        isOpen={modalStates.isBuyerModalOpen}
        onClose={modalStates.closeBuyerModal}
        filters={filterStates.buyerReportFilters}
        setFilters={filterStates.setBuyerReportFilters}
        onExport={exportHandlers.handleBuyerExport}
        uniqueTobaccoTypes={inventoryData.uniqueTobaccoTypes}
        uniqueStationIds={inventoryData.uniqueStationIds}
      />

      <SalesDateModal
        isOpen={modalStates.isSalesDateModalOpen}
        onClose={modalStates.closeSalesDateModal}
        filters={filterStates.salesDateFilters}
        setFilters={filterStates.setSalesDateFilters}
        onExport={exportHandlers.handleSalesDateExport}
        uniqueTobaccoTypes={inventoryData.uniqueTobaccoTypes}
        uniqueStationIds={inventoryData.uniqueStationIds}
      />

      <StationSummaryModal
        isOpen={modalStates.isStationSummaryModalOpen}
        onClose={modalStates.closeStationSummaryModal}
        filters={filterStates.stationSummaryFilters}
        setFilters={filterStates.setStationSummaryFilters}
        onExport={exportHandlers.handleStationSummaryExport}
        uniqueTobaccoTypes={inventoryData.uniqueTobaccoTypes}
      />
      
      <FarmerSummaryModal
        isOpen={modalStates.isFarmerSummaryModalOpen}
        onClose={modalStates.closeFarmerModal}
        data={inventoryData.data}
      />
    </>
  )
}
