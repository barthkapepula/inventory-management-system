import { useState } from 'react'
import type { 
  StationReportFilters,
  BuyerReportFilters,
  DateBasedReportFilters,
  StationSummaryFilters
} from '../components/inventory'

const INITIAL_STATION_REPORT_FILTERS: StationReportFilters = {
  stationId: "",
  dateFrom: "",
  dateTo: "",
}

const INITIAL_BUYER_REPORT_FILTERS: BuyerReportFilters = {
  stationId: undefined,
  tobaccoType: "All Types",
  dateFrom: "",
  dateTo: "",
}

const INITIAL_SALES_DATE_FILTERS: DateBasedReportFilters = {
  dateFrom: "",
  dateTo: "",
  tobaccoType: undefined,
  stationId: undefined,
  reportType: "daily",
}

const INITIAL_STATION_SUMMARY_FILTERS: StationSummaryFilters = {
  dateFrom: "",
  dateTo: "",
  tobaccoType: "",
}

export function useFilterStates() {
  const [stationReportFilters, setStationReportFilters] = useState<StationReportFilters>(
    INITIAL_STATION_REPORT_FILTERS
  )
  
  const [buyerReportFilters, setBuyerReportFilters] = useState<BuyerReportFilters>(
    INITIAL_BUYER_REPORT_FILTERS
  )
  
  const [salesDateFilters, setSalesDateFilters] = useState<DateBasedReportFilters>(
    INITIAL_SALES_DATE_FILTERS
  )
  
  const [stationSummaryFilters, setStationSummaryFilters] = useState<StationSummaryFilters>(
    INITIAL_STATION_SUMMARY_FILTERS
  )

  return {
    stationReportFilters,
    setStationReportFilters,
    buyerReportFilters,
    setBuyerReportFilters,
    salesDateFilters,
    setSalesDateFilters,
    stationSummaryFilters,
    setStationSummaryFilters,
  }
}
