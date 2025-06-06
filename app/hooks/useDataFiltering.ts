import { useMemo } from 'react'
import type { InventoryItem, InventoryFilters } from '../types/inventory'

interface Filters {
  farmerId?: string
  buyerId?: string
  tobaccoType?: string
  stationId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export function useDataFiltering(data: InventoryItem[], filters: InventoryFilters) {
  return useMemo(() => {
    return data.filter((item) => {
      const matchesFarmerId = !filters.farmerId || 
        item.farmerId.toLowerCase().includes(filters.farmerId.toLowerCase())
      
      const matchesBuyerId = !filters.buyerId || 
        item.buyerId.toLowerCase().includes(filters.buyerId.toLowerCase())
      
      const matchesTobaccoType = !filters.tobaccoType || 
        item.tobaccoType === filters.tobaccoType
      
      const matchesStationId = !filters.stationId || 
        item.stationId === filters.stationId
      
      const matchesSearch = !filters.search || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(filters.search!.toLowerCase())
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

      return matchesFarmerId && matchesBuyerId && matchesTobaccoType && 
             matchesStationId && matchesSearch && matchesDateRange
    })
  }, [data, filters])
}