import { useState, useEffect, useMemo } from "react"
import { InventoryItem, Filters, SortConfig } from "./types"
import { parseDate, getUniqueValues } from "./utils"

const ITEMS_PER_PAGE = 10

export function useInventoryData() {
  const [data, setData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    farmerId: "",
    buyerId: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    tobaccoType: "",
    stationId: "",
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          "https://tobacco-management-system-server-98pz.onrender.com/api/v1/fetch/inventory",
        )
        const result = await response.json()
        setData(result.message || [])
      } catch (err) {
        setError("Failed to fetch inventory data")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get unique values for filter dropdowns
  const uniqueFarmerIds = useMemo(() => getUniqueValues(data, "farmerId"), [data])
  const uniqueBuyerIds = useMemo(() => getUniqueValues(data, "buyerId"), [data])
  const uniqueTobaccoTypes = useMemo(() => getUniqueValues(data, "tobaccoType"), [data])
  const uniqueStationIds = useMemo(() => getUniqueValues(data, "stationId"), [data])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((item) => {
      // Only include records with price > 0
      const price = Number.parseFloat(item.price || "0")
      if (price <= 0) return false

      const matchesFarmerId = !filters.farmerId || item.farmerId.toLowerCase().includes(filters.farmerId.toLowerCase())
      const matchesBuyerId = !filters.buyerId || item.buyerId.toLowerCase().includes(filters.buyerId.toLowerCase())
      const matchesTobaccoType =
        !filters.tobaccoType || item.tobaccoType.toLowerCase().includes(filters.tobaccoType.toLowerCase())
      const matchesStationId =
        !filters.stationId || item.stationId.toLowerCase().includes(filters.stationId.toLowerCase())

      // Date range filtering
      const matchesDateRange = (() => {
        if (!filters.dateFrom && !filters.dateTo) return true

        const itemDate = parseDate(item.dateFormated)
        if (!itemDate) return false

        let matchesFrom = true
        let matchesTo = true

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom)
          matchesFrom = itemDate >= fromDate
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo)
          matchesTo = itemDate <= toDate
        }

        return matchesFrom && matchesTo
      })()

      const matchesSearch =
        !filters.search ||
        Object.values(item).some((value) => value.toString().toLowerCase().includes(filters.search.toLowerCase()))

      return (
        matchesFarmerId && matchesBuyerId && matchesTobaccoType && matchesStationId && matchesDateRange && matchesSearch
      )
    })

    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, filters, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Handle sorting
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  return {
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
  }
}
