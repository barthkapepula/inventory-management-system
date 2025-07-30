import { useMemo } from 'react'
import type { InventoryItem, Filters as InventoryFilters, SortConfig } from '../components/inventory/types'

export function useDataFiltering(data: InventoryItem[], filters: InventoryFilters, sortConfig: SortConfig) {
  return useMemo(() => {
    const filtered = data.filter((item) => {
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

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered
  }, [data, filters, sortConfig])
}
