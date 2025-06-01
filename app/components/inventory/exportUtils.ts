import { InventoryItem, Filters, StationReportFilters } from "./types"
import { parseDate } from "./utils"

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

export const exportToPDF = (data: InventoryItem[], filters: Filters) => {
  const validPriceData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0")
    return price > 0
  })

  if (validPriceData.length === 0) {
    alert("No records with valid prices found for the selected filters.")
    return
  }

  // Group data by date and station for summary
  const summaryData = validPriceData.reduce(
    (acc, item) => {
      const key = `${item.dateFormated}-${item.stationId}-${item.tobaccoType}`

      if (!acc[key]) {
        acc[key] = {
          date: item.dateFormated,
          stationId: item.stationId,
          tobaccoType: item.tobaccoType,
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

  // Calculate totals
  const totals = summaryArray.reduce(
    (acc, item) => ({
      noOfBales: acc.noOfBales + item.noOfBales,
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
    const dates = validPriceData.map((item) => parseDate(item.dateFormated)).filter(Boolean) as Date[]
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
      dateFrom = minDate.toLocaleDateString("en-GB")
      dateTo = maxDate.toLocaleDateString("en-GB")
    }
  }

  const uniqueStations = [...new Set(validPriceData.map((item) => item.stationId))]
  const uniqueTobaccoTypes = [...new Set(validPriceData.map((item) => item.tobaccoType))]

  const stationName = uniqueStations.length === 1 ? uniqueStations[0] : "MULTIPLE STATIONS"
  const tobaccoTypeName = uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES"

  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (!printWindow) {
    alert("Please allow popups to generate PDF")
    return
  }

  const htmlContent = generatePDFContent(summaryArray, totals, dateFrom, dateTo, stationName, tobaccoTypeName)
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export const exportStationSummaryPDF = (data: InventoryItem[], filters: StationReportFilters) => {
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.")
    return
  }

  const stationFilteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0")
    if (price <= 0) return false

    const matchesStation = !filters.stationId || item.stationId === filters.stationId

    const itemDate = parseDate(item.dateFormated)
    if (!itemDate) return false

    const fromDate = new Date(filters.dateFrom)
    const toDate = new Date(filters.dateTo)
    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate

    return matchesStation && matchesDateRange
  })

  if (stationFilteredData.length === 0) {
    alert("No records found for the selected criteria.")
    return
  }

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
    averagePrice: station.priceCount > 0 ? (station.priceSum / station.priceCount).toFixed(2) : "0.00",
  }))

  const totals = stationArray.reduce(
    (acc, station) => ({
      noOfBales: acc.noOfBales + station.noOfBales,
      totalWeight: acc.totalWeight + station.totalWeight,
      totalValue: acc.totalValue + station.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 },
  )

  const uniqueTobaccoTypes = [...new Set(stationFilteredData.map((item) => item.tobaccoType))]
  const tobaccoTypeName = uniqueTobaccoTypes.length === 1 ? uniqueTobaccoTypes[0] : "MULTIPLE TYPES"

  const dateFrom = new Date(filters.dateFrom).toLocaleDateString("en-GB")
  const dateTo = new Date(filters.dateTo).toLocaleDateString("en-GB")

  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (!printWindow) {
    alert("Please allow popups to generate PDF")
    return
  }

  const htmlContent = generateStationSummaryPDFContent(stationArray, totals, dateFrom, dateTo, tobaccoTypeName)
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

const generatePDFContent = (
  summaryArray: any[],
  totals: any,
  dateFrom: string,
  dateTo: string,
  stationName: string,
  tobaccoTypeName: string
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sales_Summary_Per_Station_${new Date().toISOString().split("T")[0]}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #000; background: white; }
        .report-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000; }
        .report-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
        .header-info { margin: 5px 0; font-size: 12px; }
        .header-info strong { font-weight: bold; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .summary-table th, .summary-table td { border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 11px; }
        .summary-table th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; }
        .summary-table .text-right { text-align: right; }
        .summary-table .text-left { text-align: left; }
        .totals-row { background-color: #f5f5f5; font-weight: bold; }
        .totals-row td { border-top: 2px solid #000; }
        .filter-info { margin-bottom: 10px; font-size: 10px; color: #666; text-align: center; }
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .summary-table th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .totals-row { background-color: #f5f5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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

      <script>
        document.title = 'Sales_Summary_Per_Station_${new Date().toISOString().split("T")[0]}';
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `
}

const generateStationSummaryPDFContent = (
  stationArray: any[],
  totals: any,
  dateFrom: string,
  dateTo: string,
  tobaccoTypeName: string
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #000; background: white; }
        .report-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; }
        .report-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
        .header-info { margin: 8px 0; font-size: 12px; text-align: left; }
        .header-info strong { font-weight: bold; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .summary-table th, .summary-table td { border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 11px; }
        .summary-table th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; }
        .summary-table .text-right { text-align: right; }
        .summary-table .text-left { text-align: left; }
        .totals-row { background-color: #f5f5f5; font-weight: bold; }
        .totals-row td { border-top: 2px solid #000; font-weight: bold; }
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .summary-table th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .totals-row { background-color: #f5f5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
        document.title = 'Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}';
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `
}
