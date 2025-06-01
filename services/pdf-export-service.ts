import type {
  InventoryItem,
  BuyerReportFilters,
  SalesDateReportFilters,
  StationSummaryFilters,
} from "@/types/inventory"
import { generatePDFReport, parseDate } from "@/utils/pdf-generator"

export function exportInventoryToExcel(filteredData: InventoryItem[]) {
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
    ...filteredData.map((item) => {
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

export function exportInventoryToPDF(
  filteredData: InventoryItem[],
  dateFrom: string,
  dateTo: string,
  filters: { dateFrom: string; dateTo: string },
) {
  // Only include records with price > 0 for PDF export
  const validPriceData = filteredData.filter((item) => {
    const price = Number.parseFloat(item.price || "0")
    return price > 0
  })

  if (validPriceData.length === 0) {
    alert("No records with valid prices found for the selected filters.")
    return
  }

  // Group data by station
  const stationSummary = validPriceData.reduce(
    (acc, item) => {
      const stationId = item.stationId

      if (!acc[stationId]) {
        acc[stationId] = {
          stationId,
          barcodes: new Set(),
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
    noOfBales: station.barcodes.size,
    unitPrice: station.priceCount > 0 ? station.priceSum / station.priceCount : 0,
  }))

  // Sort by station name
  stationArray.sort((a, b) => a.stationId.localeCompare(b.stationId))

  // Calculate totals
  const totals = stationArray.reduce(
    (acc, station) => ({
      noOfBales: acc.noOfBales + station.noOfBales,
      totalWeight: acc.totalWeight + station.totalWeight,
      totalValue: acc.totalValue + station.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 },
  )

  // Get date range from filters or data
  let pdfDateFrom = "All Dates"
  let pdfDateTo = "All Dates"

  if (filters.dateFrom || filters.dateTo) {
    pdfDateFrom = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString("en-GB") : "Start"
    pdfDateTo = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString("en-GB") : "End"
  } else {
    // Get from actual data
    const dates = validPriceData.map((item) => parseDate(item.dateFormated)).filter(Boolean) as Date[]
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
      pdfDateFrom = minDate.toLocaleDateString("en-GB")
      pdfDateTo = maxDate.toLocaleDateString("en-GB")
    }
  }

  // Get unique tobacco types for header
  const uniqueTobaccoTypes = [...new Set(validPriceData.map((item) => item.tobaccoType))]
  const tobaccoTypeName = uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES"

  const htmlContent = `
    <div class="report-header">
      <div class="report-title">Sales Summary Per Station</div>
      <div class="header-info"><strong>Date:</strong> ${pdfDateFrom} until ${pdfDateTo}</div>
      <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
      <div class="header-info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
    </div>

    <div class="filter-info">
      <strong>Note:</strong> Only records with price > $0 are included in this summary
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Station ID</th>
          <th>No. of Bales</th>
          <th>Weight</th>
          <th>Unit Price</th>
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
            <td class="text-right">${station.unitPrice.toFixed(2)}</td>
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
  `

  return generatePDFReport(htmlContent, `Sales_Summary_Per_Station_${new Date().toISOString().split("T")[0]}`)
}

export function exportStationSummaryPDF(
  data: InventoryItem[],
  stationReportFilters: { stationId: string; dateFrom: string; dateTo: string },
) {
  if (!stationReportFilters.dateFrom || !stationReportFilters.dateTo) {
    alert("Please select both start and end dates.")
    return false
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
    return false
  }

  // Group data by station
  const stationSummary = stationFilteredData.reduce(
    (acc, item) => {
      const stationId = item.stationId

      if (!acc[stationId]) {
        acc[stationId] = {
          stationId,
          barcodes: new Set(),
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
    noOfBales: station.barcodes.size,
    unitPrice: station.priceCount > 0 ? station.priceSum / station.priceCount : 0,
  }))

  // Sort by station name
  stationArray.sort((a, b) => a.stationId.localeCompare(b.stationId))

  // Calculate totals
  const totals = stationArray.reduce(
    (acc, station) => ({
      noOfBales: acc.noOfBales + station.noOfBales,
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
    <div class="report-header">
      <div class="report-title">Sales Summary by Station</div>
      <div class="header-info"><strong>Date:</strong> ${dateFrom} until ${dateTo}</div>
      <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
      <div class="header-info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Station ID</th>
          <th>No. of Bales</th>
          <th>Weight</th>
          <th>Unit Price</th>
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
            <td class="text-right">${station.unitPrice.toFixed(2)}</td>
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
  `

  return generatePDFReport(htmlContent, `Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}`)
}

export function exportBuyerSummaryPDF(data: InventoryItem[], buyerReportFilters: BuyerReportFilters) {
  if (!buyerReportFilters.dateFrom || !buyerReportFilters.dateTo) {
    alert("Please select both start and end dates.")
    return false
  }

  // Filter data based on modal selections
  const buyerFilteredData = data.filter((item) => {
    // Only include records with price > 0
    const price = Number.parseFloat(item.price || "0")
    if (price <= 0) return false

    // Buyer filter
    const matchesBuyer = !buyerReportFilters.buyerId || item.buyerId === buyerReportFilters.buyerId

    // Tobacco type filter
    const matchesTobaccoType = !buyerReportFilters.tobaccoType || item.tobaccoType === buyerReportFilters.tobaccoType

    // Date range filter
    const itemDate = parseDate(item.dateFormated)
    if (!itemDate) return false

    const fromDate = new Date(buyerReportFilters.dateFrom)
    const toDate = new Date(buyerReportFilters.dateTo)
    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

    return matchesBuyer && matchesTobaccoType && matchesDateRange
  })

  if (buyerFilteredData.length === 0) {
    alert("No records found for the selected criteria.")
    return false
  }

  // Group data by buyer
  const buyerSummary = buyerFilteredData.reduce(
    (acc, item) => {
      const buyerId = item.buyerId

      if (!acc[buyerId]) {
        acc[buyerId] = {
          buyerId,
          barcodes: new Set(),
          totalWeight: 0,
          totalValue: 0,
          priceSum: 0,
          priceCount: 0,
          tobaccoTypes: new Set(),
          stations: new Set(),
        }
      }

      // Add barcode to set (automatically handles uniqueness)
      if (item.barcodeId) {
        acc[buyerId].barcodes.add(item.barcodeId)
      }

      // Add tobacco type to set
      acc[buyerId].tobaccoTypes.add(item.tobaccoType)

      // Add this line in the data processing
      acc[buyerId].stations.add(item.stationId)

      acc[buyerId].totalWeight += Number.parseFloat(item.weight || "0")

      const price = Number.parseFloat(item.price)
      const weight = Number.parseFloat(item.weight || "0")
      acc[buyerId].totalValue += price * weight
      acc[buyerId].priceSum += price
      acc[buyerId].priceCount += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const buyerArray = Object.values(buyerSummary).map((buyer: any) => ({
    ...buyer,
    noOfBales: buyer.barcodes.size,
    unitPrice: buyer.priceCount > 0 ? buyer.priceSum / buyer.priceCount : 0,
    tobaccoTypesList: Array.from(buyer.tobaccoTypes).join(", "),
    stationsList: Array.from(buyer.stations).join(", "),
  }))

  // Sort by buyer ID
  buyerArray.sort((a, b) => a.buyerId.localeCompare(b.buyerId))

  // Calculate totals
  const totals = buyerArray.reduce(
    (acc, buyer) => ({
      noOfBales: acc.noOfBales + buyer.noOfBales,
      totalWeight: acc.totalWeight + buyer.totalWeight,
      totalValue: acc.totalValue + buyer.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 },
  )

  // Get tobacco types
  const uniqueTobaccoTypes = [...new Set(buyerFilteredData.map((item) => item.tobaccoType))]
  const tobaccoTypeName =
    buyerReportFilters.tobaccoType || (uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES")

  const dateFrom = new Date(buyerReportFilters.dateFrom).toLocaleDateString("en-GB")
  const dateTo = new Date(buyerReportFilters.dateTo).toLocaleDateString("en-GB")

  // Create PDF content
  const htmlContent = `
    <div class="report-header">
      <div class="report-title">Sales Summary by Buyer</div>
      <div class="header-info"><strong>Date:</strong> ${dateFrom} until ${dateTo}</div>
      <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
      ${buyerReportFilters.buyerId ? `<div class="header-info"><strong>Buyer ID:</strong> ${buyerReportFilters.buyerId}</div>` : ""}
      <div class="header-info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Buyer ID</th>
          <th>No. of Bales</th>
          <th>Weight</th>
          <th>Unit Price</th>
          <th>Total ($)</th>
          <th>Station ID</th>
          ${!buyerReportFilters.tobaccoType ? "<th>Tobacco Types</th>" : ""}
        </tr>
      </thead>
      <tbody>
        ${buyerArray
          .map(
            (buyer) => `
          <tr>
            <td class="text-left">${buyer.buyerId}</td>
            <td>${buyer.noOfBales}</td>
            <td class="text-right">${buyer.totalWeight.toFixed(0)}</td>
            <td class="text-right">${buyer.unitPrice.toFixed(2)}</td>
            <td class="text-right">${buyer.totalValue.toFixed(2)}</td>
            <td class="text-left">${buyer.stationsList}</td>
            ${!buyerReportFilters.tobaccoType ? `<td class="text-left">${buyer.tobaccoTypesList}</td>` : ""}
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
          <td></td>
          ${!buyerReportFilters.tobaccoType ? "<td></td>" : ""}
        </tr>
      </tbody>
    </table>
  `

  return generatePDFReport(htmlContent, `Sales_Summary_By_Buyer_${new Date().toISOString().split("T")[0]}`)
}

export function exportSalesDateRangePDF(data: InventoryItem[], salesDateFilters: SalesDateReportFilters) {
  if (!salesDateFilters.dateFrom || !salesDateFilters.dateTo || !salesDateFilters.stationId) {
    alert("Please select date range and station.")
    return false
  }

  // Filter data based on date range and tobacco type
  const dateFilteredData = data.filter((item) => {
    // Only include records with price > 0
    const price = Number.parseFloat(item.price || "0")
    if (price <= 0) return false

    // Station filter (required)
    const matchesStation = item.stationId === salesDateFilters.stationId

    // Tobacco type filter
    const matchesTobaccoType = !salesDateFilters.tobaccoType || item.tobaccoType === salesDateFilters.tobaccoType

    // Date range filter
    const itemDate = parseDate(item.dateFormated)
    if (!itemDate) return false

    const fromDate = new Date(salesDateFilters.dateFrom)
    const toDate = new Date(salesDateFilters.dateTo)
    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

    return matchesStation && matchesTobaccoType && matchesDateRange
  })

  if (dateFilteredData.length === 0) {
    alert("No records found for the selected criteria.")
    return false
  }

  // Group data by date
  const dateSummary = dateFilteredData.reduce(
    (acc, item) => {
      const date = item.dateFormated

      if (!acc[date]) {
        acc[date] = {
          date,
          barcodes: new Set(),
          totalWeight: 0,
          totalValue: 0,
          priceSum: 0,
          priceCount: 0,
          stations: new Set(),
          buyers: new Set(),
          tobaccoTypes: new Set(),
        }
      }

      // Add barcode to set (automatically handles uniqueness)
      if (item.barcodeId) {
        acc[date].barcodes.add(item.barcodeId)
      }

      // Add unique identifiers
      acc[date].stations.add(item.stationId)
      acc[date].buyers.add(item.buyerId)
      acc[date].tobaccoTypes.add(item.tobaccoType)

      acc[date].totalWeight += Number.parseFloat(item.weight || "0")

      const price = Number.parseFloat(item.price)
      const weight = Number.parseFloat(item.weight || "0")
      acc[date].totalValue += price * weight
      acc[date].priceSum += price
      acc[date].priceCount += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const dateArray = Object.values(dateSummary).map((dateItem: any) => ({
    ...dateItem,
    noOfBales: dateItem.barcodes.size,
    unitPrice: dateItem.priceCount > 0 ? dateItem.priceSum / dateItem.priceCount : 0,
    stationCount: dateItem.stations.size,
    buyerCount: dateItem.buyers.size,
    tobaccoTypeCount: dateItem.tobaccoTypes.size,
  }))

  // Sort by date
  dateArray.sort((a, b) => {
    const dateA = parseDate(a.date)
    const dateB = parseDate(b.date)
    if (!dateA || !dateB) return 0
    return dateA.getTime() - dateB.getTime()
  })

  // Calculate totals
  const totals = dateArray.reduce(
    (acc, dateItem) => ({
      noOfBales: acc.noOfBales + dateItem.noOfBales,
      totalWeight: acc.totalWeight + dateItem.totalWeight,
      totalValue: acc.totalValue + dateItem.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 },
  )

  const dateFrom = new Date(salesDateFilters.dateFrom).toLocaleDateString("en-GB")
  const dateTo = new Date(salesDateFilters.dateTo).toLocaleDateString("en-GB")

  // Get tobacco type name
  const tobaccoTypeName = salesDateFilters.tobaccoType || "ALL TYPES"

  // Create PDF content
  const htmlContent = `
  <div class="report-header">
    <div class="report-title">Daily Sales Summary</div>
    <div class="header-info"><strong>Station:</strong> ${salesDateFilters.stationId}</div>
    <div class="header-info"><strong>Date Range:</strong> ${dateFrom} until ${dateTo}</div>
    <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
    <div class="header-info"><strong>Total Days:</strong> ${dateArray.length}</div>
    <div class="header-info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
  </div>

    <div class="filter-info">
      <strong>Note:</strong> Only records with price > $0 are included in this summary
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>No. of Bales</th>
          <th>Weight</th>
          <th>Unit Price</th>
          <th>Total ($)</th>
        </tr>
      </thead>
      <tbody>
        ${dateArray
          .map(
            (dateItem) => `
          <tr>
            <td class="text-left">${dateItem.date}</td>
            <td>${dateItem.noOfBales}</td>
            <td class="text-right">${dateItem.totalWeight.toFixed(0)}</td>
            <td class="text-right">${dateItem.unitPrice.toFixed(2)}</td>
            <td class="text-right">${dateItem.totalValue.toFixed(2)}</td>
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
  `

  return generatePDFReport(
    htmlContent,
    `Daily_Sales_Summary_${salesDateFilters.stationId}_${new Date().toISOString().split("T")[0]}`,
  )
}

export function exportStationSummaryByDatePDF(data: InventoryItem[], stationSummaryFilters: StationSummaryFilters) {
  if (!stationSummaryFilters.dateFrom || !stationSummaryFilters.dateTo) {
    alert("Please select both start and end dates.")
    return false
  }

  // Filter data based on modal selections
  const stationFilteredData = data.filter((item) => {
    // Only include records with price > 0
    const price = Number.parseFloat(item.price || "0")
    if (price <= 0) return false

    // Tobacco type filter
    const matchesTobaccoType =
      !stationSummaryFilters.tobaccoType || item.tobaccoType === stationSummaryFilters.tobaccoType

    // Date range filter
    const itemDate = parseDate(item.dateFormated)
    if (!itemDate) return false

    const fromDate = new Date(stationSummaryFilters.dateFrom)
    const toDate = new Date(stationSummaryFilters.dateTo)
    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

    return matchesTobaccoType && matchesDateRange
  })

  if (stationFilteredData.length === 0) {
    alert("No records found for the selected criteria.")
    return false
  }

  // Group data by station
  const stationSummary = stationFilteredData.reduce(
    (acc, item) => {
      const stationId = item.stationId

      if (!acc[stationId]) {
        acc[stationId] = {
          stationId,
          barcodes: new Set(),
          totalWeight: 0,
          totalValue: 0,
          priceSum: 0,
          priceCount: 0,
          buyers: new Set(),
          tobaccoTypes: new Set(),
        }
      }

      // Add barcode to set (automatically handles uniqueness)
      if (item.barcodeId) {
        acc[stationId].barcodes.add(item.barcodeId)
      }

      // Add buyers and tobacco types
      acc[stationId].buyers.add(item.buyerId)
      acc[stationId].tobaccoTypes.add(item.tobaccoType)

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
    noOfBales: station.barcodes.size,
    unitPrice: station.priceCount > 0 ? station.priceSum / station.priceCount : 0,
    buyerCount: station.buyers.size,
    tobaccoTypesList: Array.from(station.tobaccoTypes).join(", "),
  }))

  // Sort by station name
  stationArray.sort((a, b) => a.stationId.localeCompare(b.stationId))

  // Calculate totals
  const totals = stationArray.reduce(
    (acc, station) => ({
      noOfBales: acc.noOfBales + station.noOfBales,
      totalWeight: acc.totalWeight + station.totalWeight,
      totalValue: acc.totalValue + station.totalValue,
      totalBuyers: acc.totalBuyers + station.buyerCount,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0, totalBuyers: 0 },
  )

  // Get tobacco type name
  const tobaccoTypeName = stationSummaryFilters.tobaccoType || "ALL TYPES"

  const dateFrom = new Date(stationSummaryFilters.dateFrom).toLocaleDateString("en-GB")
  const dateTo = new Date(stationSummaryFilters.dateTo).toLocaleDateString("en-GB")

  // Create PDF content
  const htmlContent = `
    <div class="report-header">
      <div class="report-title">Summary by Station</div>
      <div class="header-info"><strong>Date Range:</strong> ${dateFrom} until ${dateTo}</div>
      <div class="header-info"><strong>Tobacco Type:</strong> ${tobaccoTypeName}</div>
      <div class="header-info"><strong>Total Stations:</strong> ${stationArray.length}</div>
      <div class="header-info"><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
    </div>

    <div class="filter-info">
      <strong>Note:</strong> Only records with price > $0 are included in this summary
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Station ID</th>
          <th>No. of Bales</th>
          <th>Weight</th>
          <th>Unit Price</th>
          <th>Total ($)</th>
          <th>Buyers</th>
          ${!stationSummaryFilters.tobaccoType ? "<th>Tobacco Types</th>" : ""}
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
            <td class="text-right">${station.unitPrice.toFixed(2)}</td>
            <td class="text-right">${station.totalValue.toFixed(2)}</td>
            <td>${station.buyerCount}</td>
            ${!stationSummaryFilters.tobaccoType ? `<td class="text-left">${station.tobaccoTypesList}</td>` : ""}
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
          <td><strong>${totals.totalBuyers}</strong></td>
          ${!stationSummaryFilters.tobaccoType ? "<td></td>" : ""}
        </tr>
      </tbody>
    </table>
  `

  return generatePDFReport(htmlContent, `Summary_By_Station_${new Date().toISOString().split("T")[0]}`)
}
