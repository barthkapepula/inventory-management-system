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
  dateFormated: string
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
    dateFormated: "",
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

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((item) => {
      const matchesFarmerId = !filters.farmerId || item.farmerId.toLowerCase().includes(filters.farmerId.toLowerCase())
      const matchesBuyerId = !filters.buyerId || item.buyerId.toLowerCase().includes(filters.buyerId.toLowerCase())
      const matchesTobaccoType =
        !filters.tobaccoType || item.tobaccoType.toLowerCase().includes(filters.tobaccoType.toLowerCase())
      const matchesStationId =
        !filters.stationId || item.stationId.toLowerCase().includes(filters.stationId.toLowerCase())

      // Improved date filtering
      const matchesDate = (() => {
        if (!filters.dateFormated) return true

        // Convert the filter date (YYYY-MM-DD) to DD/M/YYYY format to match API data
        const filterDate = new Date(filters.dateFormated)
        const filterDay = filterDate.getDate()
        const filterMonth = filterDate.getMonth() + 1 // getMonth() returns 0-11
        const filterYear = filterDate.getFullYear()
        const formattedFilterDate = `${filterDay}/${filterMonth}/${filterYear}`

        // Also check if the item date matches the formatted filter date
        return item.dateFormated === formattedFilterDate
      })()

      const matchesSearch =
        !filters.search ||
        Object.values(item).some((value) => value.toString().toLowerCase().includes(filters.search.toLowerCase()))

      return matchesFarmerId && matchesBuyerId && matchesTobaccoType && matchesStationId && matchesDate && matchesSearch
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

  // Export to PDF (Clean, professional table with direct PDF generation)
  const exportToPDF = () => {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    // Calculate USD values for all items
    const dataWithUSD = filteredAndSortedData.map((item) => ({
      ...item,
      usdValue:
        item.price && item.weight
          ? (Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2)
          : "0.00",
    }))

    // Create a clean, minimal HTML structure optimized for PDF
    const printWindow = window.open("", "_blank", "width=1200,height=800")
    if (!printWindow) {
      alert("Please allow popups to generate PDF")
      return
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tobacco_Inventory_Report_${new Date().toISOString().split("T")[0]}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 8px;
          line-height: 1.2;
          color: #000;
          background: white;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #000;
        }
        
        .report-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
          color: #000;
        }
        
        .report-info {
          font-size: 9px;
          color: #333;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        
        .data-table th,
        .data-table td {
          border: 0.5px solid #000;
          padding: 3px 2px;
          text-align: left;
          vertical-align: top;
          font-size: 7px;
        }
        
        .data-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
          font-size: 7px;
          padding: 4px 2px;
        }
        
        .data-table tbody tr:nth-child(even) {
          background-color: #f8f8f8;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-mono { font-family: 'Courier New', monospace; }
        
        .col-barcode { width: 8%; }
        .col-weight { width: 6%; }
        .col-farmer { width: 8%; }
        .col-station { width: 6%; }
        .col-buyer { width: 8%; }
        .col-registrar { width: 8%; }
        .col-lot { width: 6%; }
        .col-grade { width: 6%; }
        .col-price { width: 6%; }
        .col-usd { width: 7%; }
        .col-tobacco { width: 9%; }
        .col-date { width: 7%; }
        .col-dispatch { width: 15%; }
        
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .data-table th {
            background-color: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .data-table tbody tr:nth-child(even) {
            background-color: #f8f8f8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div class="report-title">TOBACCO INVENTORY REPORT</div>
        <div class="report-info">
          Generated: ${currentDate} ${currentTime} | 
          Records: ${dataWithUSD.length} | 
          ${Object.values(filters).some((f) => f) ? "Filtered Data" : "Complete Dataset"}
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th class="col-barcode">Barcode ID</th>
            <th class="col-weight">Weight (kg)</th>
            <th class="col-farmer">Farmer ID</th>
            <th class="col-station">Station</th>
            <th class="col-buyer">Buyer ID</th>
            <th class="col-registrar">Registrar</th>
            <th class="col-lot">Lot #</th>
            <th class="col-grade">Grade</th>
            <th class="col-price">Price ($)</th>
            <th class="col-usd">USD Value</th>
            <th class="col-tobacco">Tobacco Type</th>
            <th class="col-date">Date</th>
            <th class="col-dispatch">Dispatch ID</th>
          </tr>
        </thead>
        <tbody>
          ${dataWithUSD
            .map(
              (item, index) => `
            <tr>
              <td class="text-mono">${item.barcodeId || ""}</td>
              <td class="text-right">${item.weight}</td>
              <td class="text-center">${item.farmerId}</td>
              <td class="text-center">${item.stationId}</td>
              <td class="text-center">${item.buyerId}</td>
              <td>${item.registra}</td>
              <td class="text-center">${item.lotNumber}</td>
              <td class="text-center">${item.grade || ""}</td>
              <td class="text-right">${item.price || ""}</td>
              <td class="text-right">${item.usdValue}</td>
              <td>${item.tobaccoType}</td>
              <td class="text-center">${item.dateFormated}</td>
              <td class="text-mono">${item.dispatchId || ""}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">📄 Save as PDF</button>
        <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">✖ Close</button>
      </div>

      <script>
        // Set document title for better PDF naming
        document.title = 'Tobacco_Inventory_Report_${new Date().toISOString().split("T")[0]}';
        
        // Focus on the print button
        window.onload = function() {
          const printBtn = document.querySelector('button[onclick="window.print()"]');
          if (printBtn) {
            printBtn.focus();
            printBtn.style.animation = 'pulse 2s infinite';
          }
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
            <div className="text-2xl font-bold">{data.filter((item) => hasMissingData(item)).length}</div>
            <p className="text-sm text-gray-600">Incomplete Records</p>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={filters.dateFormated}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFormated: e.target.value }))}
                placeholder="Select date"
              />
              {filters.dateFormated && (
                <p className="text-xs text-gray-500 mt-1">
                  Filtering for: {(() => {
                    const date = new Date(filters.dateFormated)
                    const day = date.getDate()
                    const month = date.getMonth() + 1
                    const year = date.getFullYear()
                    return `${day}/${month}/${year}`
                  })()}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({ farmerId: "", buyerId: "", dateFormated: "", search: "", tobaccoType: "", stationId: "" })
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
    </div>
  )
}
