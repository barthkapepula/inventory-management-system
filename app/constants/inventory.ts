import type { VisibleColumns } from '../components/inventory'

export const INITIAL_VISIBLE_COLUMNS: VisibleColumns = {
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
}

export const DEFAULT_ITEMS_PER_PAGE = 10

export const SORT_CONFIG = {
  key: null,
  direction: "asc" as const
}