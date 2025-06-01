import { InventoryItem, Filters, StationReportFilters } from "./types"
import { parseDate } from "./utils"
import jsPDF from "jspdf"

export interface DateRangeFilters {
  dateFrom: string
  dateTo: string
  stationId?: string
  tobaccoType?: string
}

export interface BuyerReportFilters {
  dateFrom: string
  dateTo: string
  tobaccoType?: string
  stationId?: string
}

export const exportToCSV = (data: InventoryItem[]) => {
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
    ...data.map((item) => {
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

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `tobacco-inventory-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

// Helper function to add company header
const addCompanyHeader = (doc: jsPDF, reportTitle: string) => {
  // Company name
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(44, 62, 80) // Dark blue
  doc.text("EASTERN TOBACCO ASSOCIATION", doc.internal.pageSize.width / 2, 20, { align: "center" })

  // Subtitle
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(127, 140, 141) // Gray
  doc.text("Tobacco Inventory Management System", doc.internal.pageSize.width / 2, 28, { align: "center" })

  // Report title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(44, 62, 80)
  doc.text(reportTitle.toUpperCase(), doc.internal.pageSize.width / 2, 40, { align: "center" })

  // Line separator
  doc.setDrawColor(52, 73, 94)
  doc.setLineWidth(0.5)
  doc.line(20, 45, doc.internal.pageSize.width - 20, 45)

  return 55 // Return Y position for next content
}

// Helper function to add report info
const addReportInfo = (doc: jsPDF, startY: number, info: { [key: string]: string }) => {
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)

  let currentY = startY
  Object.entries(info).forEach(([key, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(`${key}:`, 20, currentY)
    doc.setFont("helvetica", "normal")
    doc.text(value, 60, currentY)
    currentY += 6
  })

  return currentY + 5
}

// Helper function to create a simple table
const addSimpleTable = (
  doc: jsPDF, 
  headers: string[], 
  data: string[][], 
  startY: number,
  columnWidths: number[]
) => {
  const pageWidth = doc.internal.pageSize.width
  const startX = 20
  const rowHeight = 8
  let currentY = startY

  // Draw headers
  doc.setFillColor(236, 240, 241)
  doc.rect(startX, currentY, pageWidth - 40, rowHeight, 'F')
  
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(44, 62, 80)
  
  let currentX = startX + 2
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY + 5)
    currentX += columnWidths[index]
  })
  
  // Draw header border
  doc.setDrawColor(189, 195, 199)
  doc.rect(startX, currentY, pageWidth - 40, rowHeight)
  
  currentY += rowHeight

  // Draw data rows
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(8)

  data.forEach((row, rowIndex) => {
    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(startX, currentY, pageWidth - 40, rowHeight, 'F')
    }

    // Check if this is the totals row (last row)
    const isTotalsRow = rowIndex === data.length - 1 && row[0].includes("TOTAL")
    if (isTotalsRow) {
      doc.setFillColor(213, 219, 219)
      doc.rect(startX, currentY, pageWidth - 40, rowHeight, 'F')
      doc.setFont("helvetica", "bold")
    }

    currentX = startX + 2
    row.forEach((cell, cellIndex) => {
      const align = cellIndex === 0 ? 'left' : cellIndex === 1 ? 'center' : 'right'
      const textX = align === 'right' ? currentX + columnWidths[cellIndex] - 5 : 
                   align === 'center' ? currentX + columnWidths[cellIndex] / 2 : currentX
      
      doc.text(cell, textX, currentY + 5, { align: align as any })
      currentX += columnWidths[cellIndex]
    })

    // Draw row border
    doc.setDrawColor(189, 195, 199)
    doc.rect(startX, currentY, pageWidth - 40, rowHeight)

    if (isTotalsRow) {
      doc.setFont("helvetica", "normal")
    }

    currentY += rowHeight
  })

  return currentY + 10
}

// 1. Sales Summary by Date
export const exportSalesSummaryByDatePDF = (data: InventoryItem[], filters: DateRangeFilters) => {
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.")
    return
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0")
    if (price <= 0) return false

    const matchesStation = !filters.stationId || item.stationId === filters.stationId
    const matchesTobaccoType = !filters.tobaccoType || item.tobaccoType === filters.tobaccoType

    const itemDate = parseDate(item.dateFormated)
    if (!itemDate) return false

    const fromDate = new Date(filters.dateFrom)
    const toDate = new Date(filters.dateTo)
    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

    return matchesStation && matchesTobaccoType && matchesDateRange
  })

  if (filteredData.length === 0) {
    alert("No records found for the selected criteria.")
    return
  }

  // Group data by date
  const summaryData = filteredData.reduce(
    (acc, item) => {
      const key = item.dateFormated

      if (!acc[key]) {
        acc[key] = {
          date: item.dateFormated,
          barcodes: new Set(),
          totalWeight: 0,
          totalValue: 0,
          priceSum: 0,
          priceCount: 0,
        }
      }

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
    noOfBales: item.barcodes.size,
    averagePrice: item.priceCount > 0 ? (item.priceSum / item.priceCount).toFixed(2) : "0.00",
  }))

  // Sort by date
  summaryArray.sort((a, b) => {
    const dateA = parseDate(a.date)
    const dateB = parseDate(b.date)
    if (!dateA || !dateB) return 0
    return dateA.getTime() - dateB.getTime()
  })

  const totals = summaryArray.reduce(
    (acc, item) => ({
      noOfBales: acc.noOfBales + item.noOfBales,
      totalWeight: acc.totalWeight + item.totalWeight,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 },
  )

  // Create PDF
  const doc = new jsPDF()
  let currentY = addCompanyHeader(doc, "Sales Summary by Date")

  // Add report info
  const reportInfo = {
    "Period": `${new Date(filters.dateFrom).toLocaleDateString("en-GB")} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    "Station": filters.stationId || "ALL STATIONS",
    "Tobacco Type": filters.tobaccoType || "ALL TYPES",
    "Generated": `${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`,
  }

  currentY = addReportInfo(doc, currentY, reportInfo)

  // Add note
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(127, 140, 141)
  doc.text("Note: Only records with valid prices (> $0) are included in this summary", doc.internal.pageSize.width / 2, currentY, { align: "center" })
  currentY += 10

  // Prepare table data
  const tableData = summaryArray.map(item => [
    item.date,
    item.noOfBales.toString(),
    item.totalWeight.toFixed(2),
    item.averagePrice,
    item.totalValue.toFixed(2)
  ])

  // Add totals row
  tableData.push([
    "GRAND TOTAL",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(2),
    "—",
    totals.totalValue.toFixed(2)
  ])

  // Create table
  const headers = ["Date", "No. of Bales", "Weight (kg)", "Avg. Price ($)", "Total Value ($)"]
  const columnWidths = [40, 30, 30, 30, 40]
  
  addSimpleTable(doc, headers, tableData, currentY, columnWidths)

  doc.save(`Sales_Summary_By_Date_${new Date().toISOString().split("T")[0]}.pdf`)
}

// Keep the original functions for backward compatibility
export const exportToPDF = (data: InventoryItem[], filters: Filters) => {
  const dateRangeFilters: DateRangeFilters = {
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    stationId: filters.stationId,
    tobaccoType: filters.tobaccoType
  }
  
  exportSalesSummaryByDatePDF(data, dateRangeFilters)
}

export const exportStationSummaryPDF = (data: InventoryItem[], filters: StationReportFilters) => {
  const dateRangeFilters: DateRangeFilters = {
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    stationId: filters.stationId,
    tobaccoType: undefined
  }
  
  exportSalesSummaryByDatePDF(data, dateRangeFilters)
}
