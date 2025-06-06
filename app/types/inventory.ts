// Re-export the InventoryItem type from your components (remove the duplicate interface)
export type { InventoryItem } from '../components/inventory/types'

export interface SalesDateReportFilters {
  dateFrom: string
  dateTo: string
  tobaccoType: string
  stationId: string
  reportType: string
}

export interface InventoryFilters {
  farmerId?: string
  buyerId?: string
  tobaccoType?: string
  stationId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}