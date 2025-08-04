"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

// Define types for the raw data from the API
interface SaleItem {
  _id: string
  barcodeId: string
  weight: string // Stored as string, needs parsing to number
  farmerId: string
  stationId: string
  buyerId: string
  registra: string // Farmer name
  lotNumber: string
  grade: string
  price: string // Stored as string, needs parsing to number
  tobaccoType: string
  dispatchId: string
  date: string // ISO date string, e.g., "2025-07-31T19:02:25.000Z"
  formattedDate: string // MM/DD/YYYY string, e.g., "2/4/2025"
}

// Define type for the aggregated data to be displayed in the table
interface AggregatedSale {
  saleDate: string
  farmerId: string
  farmerName: string
  station: string
  numberOfBales: number
  totalWeight: number
  totalSales: number
  totalCommission: number
  totalLoans: number
  netPay: number
}

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedStation, setSelectedStation] = useState<string>("All")

  const router = useRouter()

  // Fetch sales data from the API
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("https://tobacco-management-system-server-98pz.onrender.com/api/v1/fetch/sale")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // Assuming data.message contains the array of sale items
        setSalesData(data.message || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  // Extract unique station IDs for the filter dropdown
  const uniqueStations = useMemo(() => {
    const stations = new Set<string>()
    salesData.forEach((item) => stations.add(item.stationId))
    return ["All", ...Array.from(stations).sort()]
  }, [salesData])

  // Filter and aggregate sales data based on selected filters
  const filteredAndAggregatedSales = useMemo(() => {
    let currentFilteredData = salesData

    // Apply date range filter
    if (startDate) {
      currentFilteredData = currentFilteredData.filter((item) => new Date(item.date) >= startDate)
    }
    if (endDate) {
      // Adjust endDate to include the entire day
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      currentFilteredData = currentFilteredData.filter((item) => new Date(item.date) <= endOfDay)
    }

    // Apply station filter
    if (selectedStation !== "All") {
      currentFilteredData = currentFilteredData.filter((item) => item.stationId === selectedStation)
    }

    // Aggregate data by sale date, farmer ID, and station
    const aggregatedMap = new Map<string, AggregatedSale>()

    currentFilteredData.forEach((item) => {
      // Use the ISO date string for consistent date parsing and then format for display
      const saleDateFormatted = format(new Date(item.date), "MM/dd/yyyy")
      const key = `${saleDateFormatted}-${item.farmerId}-${item.stationId}`

      const weight = Number.parseFloat(item.weight)
      const price = Number.parseFloat(item.price)
      const saleValue = weight * price // Calculate sale value for this individual bale

      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!
        existing.numberOfBales += 1
        existing.totalWeight += weight
        existing.totalSales += saleValue
      } else {
        aggregatedMap.set(key, {
          saleDate: saleDateFormatted,
          farmerId: item.farmerId,
          farmerName: item.registra, // Assuming 'registra' is the farmer's name
          station: item.stationId,
          numberOfBales: 1,
          totalWeight: weight,
          totalSales: saleValue,
          totalCommission: 0, // Placeholder, will be calculated below
          totalLoans: 0, // Placeholder, will be calculated below
          netPay: 0, // Placeholder, will be calculated below
        })
      }
    })

    // Convert map to array and calculate derived values (commission, loans, net pay)
    return Array.from(aggregatedMap.values())
      .map((sale) => {
        // Generate a random commission between $50 and $200
        const totalCommission = Number.parseFloat((Math.random() * (200 - 50) + 50).toFixed(2))
        // Calculate total loans as 23% of total sales
        const totalLoans = Number.parseFloat((0.23 * sale.totalSales).toFixed(2))
        // Calculate net pay
        const netPay = Number.parseFloat((sale.totalSales - totalCommission - totalLoans).toFixed(2))

        return {
          ...sale,
          totalCommission,
          totalLoans,
          netPay,
        }
      })
      .sort((a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()) // Sort by sale date
  }, [salesData, startDate, endDate, selectedStation])

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg font-medium">Loading sales data...</div>
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg font-medium">Error: {error}</div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tobacco Sales Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date From Picker */}
              <div className="flex items-center gap-2">
                <label htmlFor="date-from" className="sr-only">
                  Date From
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-from"
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Date From</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Date To Picker */}
              <div className="flex items-center gap-2">
                <label htmlFor="date-to" className="sr-only">
                  Date To
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-to"
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Date To</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Station Select Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="station-select" className="sr-only">
                Select Station
              </label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger id="station-select" className="w-[180px]">
                  <SelectValue placeholder="Select Station" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStations.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button className="w-full md:w-auto">Create Schedule</Button>
              <Button variant="secondary" className="w-full md:w-auto" onClick={() => router.push("/sales-comprehensive/payments")}>
                Make Payments
              </Button>
            </div>
          </div>

          {/* Sales Data Table */}
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Farmer ID</TableHead>
                  <TableHead>Farmer Name</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead className="text-right">Bales</TableHead>
                  <TableHead className="text-right">Total Weight (kg)</TableHead>
                  <TableHead className="text-right">Total Sales ($)</TableHead>
                  <TableHead className="text-right">Commission ($)</TableHead>
                  <TableHead className="text-right">Loans ($)</TableHead>
                  <TableHead className="text-right">Net Pay ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndAggregatedSales.length > 0 ? (
                  filteredAndAggregatedSales.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell>{sale.saleDate}</TableCell>
                      <TableCell>{sale.farmerId}</TableCell>
                      <TableCell>{sale.farmerName}</TableCell>
                      <TableCell>{sale.station}</TableCell>
                      <TableCell className="text-right">{sale.numberOfBales}</TableCell>
                      <TableCell className="text-right">{sale.totalWeight.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{sale.totalSales.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{sale.totalCommission.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{sale.totalLoans.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{sale.netPay.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No sales data available for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
