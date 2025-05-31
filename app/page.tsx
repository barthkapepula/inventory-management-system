"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Filter, Search, ChevronUp, ChevronDown, Eye, FileText, AlertTriangle, Download } from "lucide-react"

interface InventoryItem {
  _id: string
  barcodeId: string
  weight: string
  farmerId: string
  stationId: string
  buyerId: string
  registra: string
  lotNumber: string
  grade: string
  price: string
  tobaccoType: string
  date: string
  dispatchId: string
  dateFormated: string
}

interface Filters {
  farmerId: string
  buyerId: string
  dateFrom: string
  dateTo: string
  search: string
  tobaccoType: string
  stationId: string
}

interface SortConfig {
  key: keyof InventoryItem | null
  direction: "asc" | "desc"
}

const ITEMS_PER_PAGE = 10

export default function TobaccoInventoryDashboard() {
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
  const [visibleColumns, setVisibleColumns] = useState({
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
  const [stationReportFilters, setStationReportFilters] = useState({
    stationId: "",
    dateFrom: "",
    dateTo: "",
  })

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
  const uniqueFarmerIds = useMemo(() => [...new Set(data.map((item) => item.farmerId))].filter(Boolean), [data])

  const uniqueBuyerIds = useMemo(() => [...new Set(data.map((item) => item.buyerId))].filter(Boolean), [data])

  const uniqueTobaccoTypes = useMemo(() => [...new Set(data.map((item) => item.tobaccoType))].filter(Boolean), [data])

  const uniqueStationIds = useMemo(() => [...new Set(data.map((item) => item.stationId))].filter(Boolean), [data])

  // Helper function to parse date from DD/M/YYYY format
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split("/")
    if (parts.length === 3) {
      const day = Number.parseInt(parts[0])
      const month = Number.parseInt(parts[1]) - 1 // Month is 0-indexed
      const year = Number.parseInt(parts[2])
      return new Date(year, month, day)
    }
    return null
  }

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

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    // Use the filtered data
    const headers = [
      "Barcode ID",
      "Weight",
      "Farmer ID",
      "Station ID",
      "Buyer ID",
      "Registrar",
      "Lot Number",
      "Grade",
      "Price",
      "USD Value",
      "Tobacco Type",
      "Date",
      "Dispatch ID",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((item) => {
        const usdValue =
          item.price && item.weight ? (Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2) : ""

        return [
          `"${item.barcodeId || ""}"`,
          `"${item.weight}"`,
          `"${item.farmerId}"`,
          `"${item.stationId}"`,
          `"${item.buyerId}"`,
          `"${item.registra}"`,
          `"${item.lotNumber}"`,
          `"${item.grade || ""}"`,
          `"${item.price || ""}"`,
          `"${usdValue}"`,
          `"${item.tobaccoType}"`,
          `"${item.dateFormated}"`,
          `"${item.dispatchId || ""}"`,
        ].join(",")
      }),
    ].join("\n")

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link element to trigger the download
    const link = document.createElement("a")
    link.href = url
    link.download = `tobacco-inventory-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  // Export to PDF (Sales Summary Per Station format)
  const exportToPDF = () => {
    // Only include records with price > 0 for PDF export
    const validPriceData = filteredAndSortedData.filter((item) => {
      const price = Number.parseFloat(item.price || "0")
      return price > 0
    })

    if (validPriceData.length === 0) {
      alert("No records with valid prices found for the selected filters.")
      return
    }

    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    // Group data by date and station for summary
    const summaryData = validPriceData.reduce(
      (acc, item) => {
        const key = `${item.dateFormated}-${item.stationId}-${item.tobaccoType}`

        if (!acc[key]) {
          acc[key] = {
            date: item.dateFormated,
            stationId: item.stationId,
            tobaccoType: item.tobaccoType,
            barcodes: new Set(), // Track unique barcodes
            totalWeight: 0,
            totalValue: 0,
            priceSum: 0,
            priceCount: 0,
          }
        }

        // Add barcode to set (automatically handles uniqueness)
        if (item.barcodeId) {
          acc[key].barcodes.add(item.barcodeId)
        }

        acc[key].totalWeight += Number.parseFloat(item.weight || "0")

        const price = Number.parseFloat(item.price)
        const weight = Number.parseFloat(item.weight || "0")
        acc[key].totalValue += price * weight
        acc[key].priceSum += price
        acc[key].priceCount += 1

        return acc
      },
      {} as Record<string, any>,
    )

    const summaryArray = Object.values(summaryData).map((item: any) => ({
      ...item,
      noOfBales: item.barcodes.size, // Count unique barcodes
      averagePrice: item.priceCount > 0 ? (item.priceSum / item.priceCount).toFixed(2) : "0.00",
    }))

    // Sort by date
    summaryArray.sort((a, b) => {
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })

    // Calculate totals
    const totals = summaryArray.reduce(
      (acc, item) => ({
        noOfBales: acc.noOfBales + item.noOfBales, // Sum of unique barcodes
        totalWeight: acc.totalWeight + item.totalWeight,
        totalValue: acc.totalValue + item.totalValue,
      }),
      { noOfBales: 0, totalWeight: 0, totalValue: 0 },
    )

    // Get date range from filters or data
    let dateFrom = "All Dates"
    let dateTo = "All Dates"

    if (filters.dateFrom || filters.dateTo) {
      dateFrom = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString("en-GB") : "Start"
      dateTo = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString("en-GB") : "End"
    } else {
      // Get from actual data
      const dates = validPriceData.map((item) => parseDate(item.dateFormated)).filter(Boolean) as Date[]
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
        dateFrom = minDate.toLocaleDateString("en-GB")
        dateTo = maxDate.toLocaleDateString("en-GB")
      }
    }

    // Get unique station and tobacco type for header
    const uniqueStations = [...new Set(validPriceData.map((item) => item.stationId))]
    const uniqueTobaccoTypes = [...new Set(validPriceData.map((item) => item.tobaccoType))]

    const stationName = uniqueStations.length === 1 ? uniqueStations[0] : "MULTIPLE STATIONS"
    const tobaccoTypeName = uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES"

    // Create PDF window
    const printWindow = window.open("", "_blank", "width=800,height=600")
    if (!printWindow) {
      alert("Please allow popups to generate PDF")
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales_Summary_Per_Station_${new Date().toISOString().split("T")[0]}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          
          .header-info {
            margin: 5px 0;
            font-size: 12px;
          }
          
          .header-info strong {
            font-weight: bold;
          }
          
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .summary-table th,
          .summary-table td {
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: center;
            font-size: 11px;
          }
          
          .summary-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .summary-table .text-right {
            text-align: right;
          }
          
          .summary-table .text-left {
            text-align: left;
          }
          
          .totals-row {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .totals-row td {
            border-top: 2px solid #000;
          }
          
          .filter-info {
            margin-bottom: 10px;
            font-size: 10px;
            color: #666;
            text-align: center;
          }
          
          @media print {
            body { 
              margin: 0; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .summary-table th {
              background-color: #f0f0f0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .totals-row {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">Sales Summary Per Station</div>
          <div class="header-info"><strong>Date:</strong> ${dateFrom} until ${dateTo}</div>
          <div class="header-info"><strong>Station ID:</strong> ${stationName}</div>
          <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
        </div>

        <div class="filter-info">
          <strong>Note:</strong> Only records with price > $0 are included in this summary
        </div>

        <table class="summary-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>No of Bales</th>
              <th>Weight (kg)</th>
              <th>Average Price ($)</th>
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            ${summaryArray
              .map(
                (item) => `
              <tr>
                <td class="text-left">${item.date}</td>
                <td>${item.noOfBales}</td>
                <td class="text-right">${item.totalWeight.toFixed(2)}</td>
                <td class="text-right">${item.averagePrice}</td>
                <td class="text-right">${item.totalValue.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="totals-row">
              <td class="text-left"><strong>TOTAL</strong></td>
              <td><strong>${totals.noOfBales}</strong></td>
              <td class="text-right"><strong>${totals.totalWeight.toFixed(2)}</strong></td>
              <td class="text-right"><strong>-</strong></td>
              <td class="text-right"><strong>${totals.totalValue.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">📄 Save as PDF</button>
          <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">✖ Close</button>
        </div>

        <script>
          // Set document title for better PDF naming
          document.title = 'Sales_Summary_Per_Station_${new Date().toISOString().split("T")[0]}';
          
          // Auto-trigger print dialog after a short delay
          window.onload = function() {
            setTimeout(function() {
              const printBtn = document.querySelector('button[onclick="window.print()"]');
              if (printBtn) {
                printBtn.focus();
                printBtn.style.animation = 'pulse 2s infinite';
              }
            }, 500);
          };
          
          // Add pulse animation
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          \`;
          document.head.appendChild(style);
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Export Summarized Report per Station
  const exportStationSummaryPDF = () => {
    if (!stationReportFilters.dateFrom || !stationReportFilters.dateTo) {
      alert("Please select both start and end dates.")
      return
    }

    // Filter data based on modal selections
    const stationFilteredData = data.filter((item) => {
      // Only include records with price > 0
      const price = Number.parseFloat(item.price || "0")
      if (price <= 0) return false

      // Station filter
      const matchesStation = !stationReportFilters.stationId || item.stationId === stationReportFilters.stationId

      // Date range filter
      const itemDate = parseDate(item.dateFormated)
      if (!itemDate) return false

      const fromDate = new Date(stationReportFilters.dateFrom)
      const toDate = new Date(stationReportFilters.dateTo)
      const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

      return matchesStation && matchesDateRange
    })

    if (stationFilteredData.length === 0) {
      alert("No records found for the selected criteria.")
      return
    }

    // Group data by station
    const stationSummary = stationFilteredData.reduce(
      (acc, item) => {
        const stationId = item.stationId

        if (!acc[stationId]) {
          acc[stationId] = {
            stationId,
            barcodes: new Set(), // Track unique barcodes
            totalWeight: 0,
            totalValue: 0,
            priceSum: 0,
            priceCount: 0,
          }
        }

        // Add barcode to set (automatically handles uniqueness)
        if (item.barcodeId) {
          acc[stationId].barcodes.add(item.barcodeId)
        }

        acc[stationId].totalWeight += Number.parseFloat(item.weight || "0")

        const price = Number.parseFloat(item.price)
        const weight = Number.parseFloat(item.weight || "0")
        acc[stationId].totalValue += price * weight
        acc[stationId].priceSum += price
        acc[stationId].priceCount += 1

        return acc
      },
      {} as Record<string, any>,
    )

    const stationArray = Object.values(stationSummary).map((station: any) => ({
      ...station,
      noOfBales: station.barcodes.size, // Count unique barcodes
      averagePrice: station.priceCount > 0 ? (station.priceSum / station.priceCount).toFixed(2) : "0.00",
    }))

    // Calculate totals
    const totals = stationArray.reduce(
      (acc, station) => ({
        noOfBales: acc.noOfBales + station.noOfBales, // Sum of unique barcodes per station
        totalWeight: acc.totalWeight + station.totalWeight,
        totalValue: acc.totalValue + station.totalValue,
      }),
      { noOfBales: 0, totalWeight: 0, totalValue: 0 },
    )

    // Get tobacco types
    const uniqueTobaccoTypes = [...new Set(stationFilteredData.map((item) => item.tobaccoType))]
    const tobaccoTypeName = uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES"

    const dateFrom = new Date(stationReportFilters.dateFrom).toLocaleDateString("en-GB")
    const dateTo = new Date(stationReportFilters.dateTo).toLocaleDateString("en-GB")

    // Create PDF content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
        }
        
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .header-info {
          margin: 8px 0;
          font-size: 12px;
          text-align: left;
        }
        
        .header-info strong {
          font-weight: bold;
        }
        
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .summary-table th,
        .summary-table td {
          border: 1px solid #000;
          padding: 10px 8px;
          text-align: center;
          font-size: 11px;
        }
        
        .summary-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .summary-table .text-right {
          text-align: right;
        }
        
        .summary-table .text-left {
          text-align: left;
        }
        
        .totals-row {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .totals-row td {
          border-top: 2px solid #000;
          font-weight: bold;
        }
        
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .summary-table th {
            background-color: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .totals-row {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div class="report-title">Sales Summary by Station</div>
        <div class="header-info"><strong>Date:</strong> ${dateFrom} until ${dateTo}</div>
        <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
      </div>

      <table class="summary-table">
        <thead>
          <tr>
            <th>Station ID</th>
            <th>No. of Bales</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Total ($)</th>
          </tr>
        </thead>
        <tbody>
          ${stationArray
            .map(
              (station) => `
            <tr>
              <td class="text-left">${station.stationId}</td>
              <td>${station.noOfBales}</td>
              <td class="text-right">${station.totalWeight.toFixed(0)}</td>
              <td class="text-right">${station.averagePrice}</td>
              <td class="text-right">${station.totalValue.toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
          <tr class="totals-row">
            <td class="text-left"><strong>TOTAL</strong></td>
            <td><strong>${totals.noOfBales}</strong></td>
            <td class="text-right"><strong>${totals.totalWeight.toFixed(0)}</strong></td>
            <td class="text-right"><strong>—</strong></td>
            <td class="text-right"><strong>${totals.totalValue.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <script>
        // Set document title for better PDF naming
        document.title = 'Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}';
        
        // Auto-trigger print dialog
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
        
        // Close window after printing
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `

    // Open new window and trigger download
    const printWindow = window.open("", "_blank", "width=800,height=600")
    if (!printWindow) {
      alert("Please allow popups to generate PDF")
      return
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Close modal after export
    setShowStationModal(false)
  }

  // Check if row has missing data
  const hasMissingData = (item: InventoryItem) => {
    return !item.price || !item.grade
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tobacco Inventory Management</h1>
          <p className="text-gray-600">Manage and track tobacco inventory records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => setShowStationModal(true)} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Summarized Report per Station
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-sm text-gray-600">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredAndSortedData.length}</div>
            <p className="text-sm text-gray-600">Filtered Results</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueFarmerIds.length}</div>
            <p className="text-sm text-gray-600">Unique Farmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data.filter((item) => Number.parseFloat(item.price || "0") > 0).length}
            </div>
            <p className="text-sm text-gray-600">Records with Price</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search all fields..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Farmer ID</label>
              <Select
                value={filters.farmerId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, farmerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Farmers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers</SelectItem>
                  {uniqueFarmerIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Buyer ID</label>
              <Select
                value={filters.buyerId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, buyerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Buyers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyers</SelectItem>
                  {uniqueBuyerIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tobacco Type</label>
              <Select
                value={filters.tobaccoType}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, tobaccoType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTobaccoTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Station ID</label>
              <Select
                value={filters.stationId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, stationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  {uniqueStationIds.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                placeholder="Start date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
            <div className="md:col-span-1">
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                placeholder="End date"
              />
            </div>

            {(filters.dateFrom || filters.dateTo) && (
              <div className="md:col-span-5 flex items-end">
                <p className="text-xs text-gray-500 mb-2">
                  Date range: {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Start"} to{" "}
                  {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "End"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  farmerId: "",
                  buyerId: "",
                  dateFrom: "",
                  dateTo: "",
                  search: "",
                  tobaccoType: "",
                  stationId: "",
                })
              }
            >
              Clear Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(visibleColumns).map(([key, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visible}
                    onCheckedChange={(checked) => setVisibleColumns((prev) => ({ ...prev, [key]: checked }))}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.barcodeId && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("barcodeId")}>
                      <div className="flex items-center gap-1">
                        Barcode ID
                        {sortConfig.key === "barcodeId" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.weight && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("weight")}>
                      <div className="flex items-center gap-1">
                        Weight
                        {sortConfig.key === "weight" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.farmerId && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("farmerId")}>
                      <div className="flex items-center gap-1">
                        Farmer ID
                        {sortConfig.key === "farmerId" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.stationId && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("stationId")}>
                      <div className="flex items-center gap-1">
                        Station ID
                        {sortConfig.key === "stationId" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.buyerId && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("buyerId")}>
                      <div className="flex items-center gap-1">
                        Buyer ID
                        {sortConfig.key === "buyerId" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.registra && <TableHead>Registrar</TableHead>}
                  {visibleColumns.lotNumber && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("lotNumber")}>
                      <div className="flex items-center gap-1">
                        Lot Number
                        {sortConfig.key === "lotNumber" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.grade && <TableHead>Grade</TableHead>}
                  {visibleColumns.price && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("price")}>
                      <div className="flex items-center gap-1">
                        Price
                        {sortConfig.key === "price" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  <TableHead>USD Value</TableHead>
                  {visibleColumns.tobaccoType && <TableHead>Tobacco Type</TableHead>}
                  {visibleColumns.dateFormated && (
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("dateFormated")}>
                      <div className="flex items-center gap-1">
                        Date
                        {sortConfig.key === "dateFormated" &&
                          (sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.dispatchId && <TableHead>Dispatch ID</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow
                    key={item._id}
                    className={`hover:bg-gray-50 ${hasMissingData(item) ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""}`}
                  >
                    {visibleColumns.barcodeId && (
                      <TableCell className="font-mono text-sm">
                        {item.barcodeId || <span className="text-gray-400">-</span>}
                      </TableCell>
                    )}
                    {visibleColumns.weight && <TableCell>{item.weight} kg</TableCell>}
                    {visibleColumns.farmerId && (
                      <TableCell>
                        <Badge variant="outline">{item.farmerId}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.stationId && <TableCell>{item.stationId}</TableCell>}
                    {visibleColumns.buyerId && (
                      <TableCell>
                        <Badge variant="secondary">{item.buyerId}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.registra && <TableCell>{item.registra}</TableCell>}
                    {visibleColumns.lotNumber && <TableCell>{item.lotNumber}</TableCell>}
                    {visibleColumns.grade && (
                      <TableCell>
                        {item.grade ? (
                          <Badge variant="default">{item.grade}</Badge>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Missing</span>
                          </div>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.price && (
                      <TableCell>
                        {item.price ? (
                          <span className="font-semibold">${item.price}</span>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Missing</span>
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {item.price && item.weight ? (
                        <span className="font-bold text-green-600">
                          ${(Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    {visibleColumns.tobaccoType && (
                      <TableCell>
                        <Badge variant="outline">{item.tobaccoType}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.dateFormated && <TableCell>{item.dateFormated}</TableCell>}
                    {visibleColumns.dispatchId && (
                      <TableCell className="font-mono text-sm">
                        {item.dispatchId || <span className="text-gray-400">-</span>}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)} of {filteredAndSortedData.length}{" "}
            results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Station Summary Modal */}
      {showStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4">Export Station Summary Report</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Station ID (Optional)</label>
                <Select
                  value={stationReportFilters.stationId}
                  onValueChange={(value) =>
                    setStationReportFilters((prev) => ({ ...prev, stationId: value === "all" ? "" : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {uniqueStationIds.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date From *</label>
                <Input
                  type="date"
                  value={stationReportFilters.dateFrom}
                  onChange={(e) => setStationReportFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date To *</label>
                <Input
                  type="date"
                  value={stationReportFilters.dateTo}
                  onChange={(e) => setStationReportFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={exportStationSummaryPDF}
                className="flex-1"
                disabled={!stationReportFilters.dateFrom || !stationReportFilters.dateTo}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => {
                  setShowStationModal(false)
                  setStationReportFilters({ stationId: "", dateFrom: "", dateTo: "" })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
