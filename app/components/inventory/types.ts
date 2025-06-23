export interface InventoryItem {
  _id: string;
  barcodeId: string;
  weight: string;
  farmerId: string;
  stationId: string;
  buyerId: string;
  registra: string;
  lotNumber: string;
  grade: string;
  price: string;
  tobaccoType: string;
  date: string;
  dispatchId: string;
  dateFormated: string;
}

export interface Filters {
  farmerId: string;
  buyerId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  tobaccoType: string;
  stationId: string;
}

export interface SortConfig {
  key: keyof InventoryItem | null;
  direction: "asc" | "desc";
}

export interface VisibleColumns {
  barcodeId: boolean;
  weight: boolean;
  farmerId: boolean;
  stationId: boolean;
  buyerId: boolean;
  registra: boolean;
  lotNumber: boolean;
  grade: boolean;
  price: boolean;
  tobaccoType: boolean;
  dateFormated: boolean;
  dispatchId: boolean;
}

export interface StationReportFilters {
  stationId: string;
  dateFrom: string;
  dateTo: string;
}

// Export filter interfaces for reports
export interface DateRangeFilters {
  dateFrom: string;
  dateTo: string;
  stationId: string;
  tobaccoType?: string;
  farmerId: string;
  buyerId: string;
}

export interface BuyerReportFilters {
  dateFrom: string;
  dateTo: string;
  tobaccoType?: string;
  stationId?: string;
}

export interface StationSummaryFilters {
  dateFrom: string;
  dateTo: string;
  tobaccoType: string;
}

export interface DateBasedReportFilters {
  dateFrom: string;
  dateTo: string;
  stationId?: string;
  tobaccoType?: string;
  reportType: "daily" | "monthly" | "yearly";
}

// Add this missing interface
export interface FarmerReportFilters {
  dateFrom: string;
  dateTo: string;
  stationId?: string;
  tobaccoType?: string;
  farmerId?: string;
  buyerId?: string;
}

export interface Stats {
  totalItems: number;
  totalWeight: number;
  totalValue: number;
  averagePrice: number;
}
