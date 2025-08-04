import {
  InventoryItem,
  Filters,
  StationReportFilters,
  DateRangeFilters,
  BuyerReportFilters,
  StationSummaryFilters,
  DateBasedReportFilters,
  FarmerReportFilters,
} from "./types";
import jsPDF from "jspdf";

function normalizeDate(dateString: string | Date): Date {
  // If already a Date object, return it
  if (dateString instanceof Date) return dateString
  
  // Try parsing as ISO string first
  const isoDate = new Date(dateString)
  if (!isNaN(isoDate.getTime())) return isoDate
  
  // Try parsing as formatted string (e.g. "Thu Jul 31 2025 06:57:49 GMT+0200")
  const formattedDate = new Date(dateString)
  if (!isNaN(formattedDate.getTime())) return formattedDate
  
  // Fallback to current date if parsing fails
  return new Date()
}

// Helper function to check if a date falls within a date range (entire day)
const isDateInRange = (itemDateString: string, fromDateString: string, toDateString: string): boolean => {
  const itemDate = normalizeDate(itemDateString);
  const fromDate = normalizeDate(fromDateString);
  const toDate = normalizeDate(toDateString);
  
  // Set time to start of day for fromDate (00:00:00)
  fromDate.setHours(0, 0, 0, 0);
  
  // Set time to end of day for toDate (23:59:59.999)
  toDate.setHours(23, 59, 59, 999);
  
  // Set item date to start of day for comparison
  const itemDateOnly = new Date(itemDate);
  itemDateOnly.setHours(0, 0, 0, 0);
  
  return itemDateOnly >= fromDate && itemDateOnly <= toDate;
};

// Helper function to format dates based on report type
const formatDateForGrouping = (
  dateString: string,
  reportType: "daily" | "monthly" | "yearly"
): string => {
  const date = normalizeDate(dateString);

  switch (reportType) {
    case "daily":
      return dateString; // Keep original format
    case "monthly":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    case "yearly":
      return date.getFullYear().toString();
    default:
      return dateString;
  }
};

// Helper function to get display format for dates
const getDisplayDate = (
  groupKey: string,
  reportType: "daily" | "monthly" | "yearly"
): string => {
  switch (reportType) {
    case "daily":
      return groupKey;
    case "monthly":
      const [year, month] = groupKey.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    case "yearly":
      return groupKey;
    default:
      return groupKey;
  }
};

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
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((item) => {
      const usdValue =
        item.price && item.weight
          ? (
              Number.parseFloat(item.price) * Number.parseFloat(item.weight)
            ).toFixed(2)
          : "";

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
      ].join(",");
    }),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `tobacco-inventory-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

// Helper function to add company header
const addCompanyHeader = (doc: jsPDF, reportTitle: string) => {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text("EASTERN TOBACCO ASSOCIATION", doc.internal.pageSize.width / 2, 20, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Tobacco Inventory Management System",
    doc.internal.pageSize.width / 2,
    28,
    { align: "center" }
  );

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text(reportTitle.toUpperCase(), doc.internal.pageSize.width / 2, 40, {
    align: "center",
  });

  doc.setDrawColor(52, 73, 94);
  doc.setLineWidth(0.5);
  doc.line(20, 45, doc.internal.pageSize.width - 20, 45);

  return 55;
};

// Helper function to add report info
const addReportInfo = (
  doc: jsPDF,
  startY: number,
  info: { [key: string]: string }
) => {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  let currentY = startY;
  Object.entries(info).forEach(([key, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${key}:`, 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, currentY);
    currentY += 6;
  });

  return currentY + 5;
};

// Helper function to create a simple table
const addSimpleTable = (
  doc: jsPDF,
  headers: string[],
  data: string[][],
  startY: number,
  columnWidths: number[]
) => {
  const pageWidth = doc.internal.pageSize.width;
  const startX = 20;
  const rowHeight = 8;
  let currentY = startY;

  // Draw headers
  doc.setFillColor(236, 240, 241);
  doc.rect(startX, currentY, pageWidth - 40, rowHeight, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);

  let currentX = startX + 2;
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY + 5);
    currentX += columnWidths[index];
  });

  doc.setDrawColor(189, 195, 199);
  doc.rect(startX, currentY, pageWidth - 40, rowHeight);

  currentY += rowHeight;

  // Draw data rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  data.forEach((row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(startX, currentY, pageWidth - 40, rowHeight, "F");
    }

    const isTotalsRow =
      rowIndex === data.length - 1 && row[0].includes("TOTAL");
    if (isTotalsRow) {
      doc.setFillColor(213, 219, 219);
      doc.rect(startX, currentY, pageWidth - 40, rowHeight, "F");
      doc.setFont("helvetica", "bold");
    }

      currentX = startX + 2;
      row.forEach((cell, cellIndex) => {
        // Ensure cell is a string
        const cellText = cell?.toString() || "";
        
        // Validate alignment
        const align = 
          cellIndex === 0 ? "left" : 
          cellIndex === 1 ? "center" : 
          "right";
        
        // Calculate text position
        const textX =
          align === "right"
            ? currentX + columnWidths[cellIndex] - 5
            : align === "center"
            ? currentX + columnWidths[cellIndex] / 2
            : currentX;

        // Only pass valid alignment options with proper typing
        const options = align === "left" ? undefined : { 
          align: align as "left" | "center" | "right" 
        };
        
        doc.text(cellText, textX, currentY + 5, options);
        currentX += columnWidths[cellIndex];
      });

    doc.setDrawColor(189, 195, 199);
    doc.rect(startX, currentY, pageWidth - 40, rowHeight);

    if (isTotalsRow) {
      doc.setFont("helvetica", "normal");
    }

    currentY += rowHeight;
  });

  return currentY + 10;
};

// 1. Sales Summary by Date Range
export const exportSalesSummaryByDatePDF = (
  data: InventoryItem[],
  filters: DateRangeFilters
) => {
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.");
    return;
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0");
    if (price <= 0) return false;

    const matchesStation =
      !filters.stationId || item.stationId === filters.stationId;
    const matchesTobaccoType =
      !filters.tobaccoType || item.tobaccoType === filters.tobaccoType;

    const matchesDateRange = isDateInRange(item.dateFormated, filters.dateFrom, filters.dateTo);

    return matchesStation && matchesTobaccoType && matchesDateRange;
  });

  if (filteredData.length === 0) {
    alert("No records found for the selected criteria.");
    return;
  }

  // Group data by date
  const summaryData = filteredData.reduce((acc, item) => {
    const key = item.dateFormated;

    if (!acc[key]) {
      acc[key] = {
        date: item.dateFormated,
        barcodes: new Set(),
        totalWeight: 0,
        totalValue: 0,
        priceSum: 0,
        priceCount: 0,
      };
    }

    if (item.barcodeId) {
      acc[key].barcodes.add(item.barcodeId);
    }

    acc[key].totalWeight += Number.parseFloat(item.weight || "0");

    const price = Number.parseFloat(item.price);
    const weight = Number.parseFloat(item.weight || "0");
    acc[key].totalValue += price * weight;
    acc[key].priceSum += price;
    acc[key].priceCount += 1;

    return acc;
  }, {} as Record<string, any>);

  const summaryArray = Object.values(summaryData).map((item: any) => ({
    ...item,
    noOfBales: item.barcodes.size,
    averagePrice:
      item.priceCount > 0
        ? (item.priceSum / item.priceCount).toFixed(2)
        : "0.00",
  }));

  summaryArray.sort((a, b) => {
    const dateA = normalizeDate(a.date);
    const dateB = normalizeDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const totals = summaryArray.reduce(
    (acc, item) => ({
      noOfBales: acc.noOfBales + item.noOfBales,
      totalWeight: acc.totalWeight + item.totalWeight,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 }
  );

  const doc = new jsPDF();
  let currentY = addCompanyHeader(doc, "Sales Summary by Date Range");

  const reportInfo = {
    Period: `${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    Station: filters.stationId || "ALL STATIONS",
    "Tobacco Type": filters.tobaccoType || "ALL TYPES",
    Generated: `${new Date().toLocaleDateString(
      "en-GB"
    )} ${new Date().toLocaleTimeString("en-GB")}`,
  };

  currentY = addReportInfo(doc, currentY, reportInfo);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: Only records with valid prices (> $0) are included in this summary",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  const tableData = summaryArray.map((item) => [
    item.date,
    item.noOfBales.toString(),
    item.totalWeight.toFixed(2),
    item.averagePrice,
    item.totalValue.toFixed(2),
  ]);

  tableData.push([
    "GRAND TOTAL",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(2),
    "—",
    totals.totalValue.toFixed(2),
  ]);

  const headers = [
    "Date",
    "No. of Bales",
    "Weight (kg)",
    "Avg. Price ($)",
    "Total Value ($)",
  ];
  const columnWidths = [40, 30, 30, 30, 40];

  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  doc.save(
    `Sales_Summary_By_Date_${new Date().toISOString().split("T")[0]}.pdf`
  );
};


// 2. Sales Summary by Station
export const exportSalesSummaryByStationPDF = (
  data: InventoryItem[],
  filters: StationSummaryFilters
) => {
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.");
    return;
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0");
    if (price <= 0) return false;

    const matchesTobaccoType =
      !filters.tobaccoType || item.tobaccoType === filters.tobaccoType;

    const matchesDateRange = isDateInRange(item.dateFormated, filters.dateFrom, filters.dateTo);

    return matchesTobaccoType && matchesDateRange;
  });

  if (filteredData.length === 0) {
    alert("No records found for the selected criteria.");
    return;
  }

  const stationSummary = filteredData.reduce((acc, item) => {
    const stationId = item.stationId;

    if (!acc[stationId]) {
      acc[stationId] = {
        stationId,
        barcodes: new Set(),
        totalWeight: 0,
        totalValue: 0,
      };
    }

    if (item.barcodeId) {
      acc[stationId].barcodes.add(item.barcodeId);
    }

    acc[stationId].totalWeight += Number.parseFloat(item.weight || "0");

    const price = Number.parseFloat(item.price);
    const weight = Number.parseFloat(item.weight || "0");
    acc[stationId].totalValue += price * weight;

    return acc;
  }, {} as Record<string, any>);

  const stationArray = Object.values(stationSummary).map((station: any) => ({
    ...station,
    noOfBales: station.barcodes.size,
    // Average Price = Total Value / Total Weight
    averagePrice:
      station.totalWeight > 0
        ? (station.totalValue / station.totalWeight).toFixed(2)
        : "0.00",
  }));

  // Sort by station ID alphabetically
  stationArray.sort((a, b) => a.stationId.localeCompare(b.stationId));

  const totals = stationArray.reduce(
    (acc, station) => ({
      noOfBales: acc.noOfBales + station.noOfBales,
      totalWeight: acc.totalWeight + station.totalWeight,
      totalValue: acc.totalValue + station.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 }
  );

  const doc = new jsPDF();
  let currentY = addCompanyHeader(doc, "Sales Summary by Station");

  const reportInfo = {
    Period: `${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    "Tobacco Type": filters.tobaccoType || "ALL TYPES",
    Generated: `${new Date().toLocaleDateString(
      "en-GB"
    )} ${new Date().toLocaleTimeString("en-GB")}`,
  };

  currentY = addReportInfo(doc, currentY, reportInfo);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: Only records with valid prices (> $0) are included. Average Price = Total Value ÷ Total Weight",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  const tableData = stationArray.map((station) => [
    station.stationId,
    station.noOfBales.toString(),
    station.totalWeight.toFixed(2),
    station.averagePrice,
    station.totalValue.toFixed(2),
  ]);

  // Calculate overall average price for totals row
  const overallAveragePrice =
    totals.totalWeight > 0
      ? (totals.totalValue / totals.totalWeight).toFixed(2)
      : "0.00";

  tableData.push([
    "GRAND TOTAL",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(2),
    overallAveragePrice,
    totals.totalValue.toFixed(2),
  ]);

  const headers = [
    "Station ID",
    "No. of Bales",
    "Weight (kg)",
    "Avg. Price ($/kg)",
    "Total Value ($)",
  ];
  const columnWidths = [40, 30, 30, 30, 40];

  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  doc.save(
    `Sales_Summary_By_Station_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

// 3. Sales Summary by Buyer (Station-specific Buyer Report)
export const exportSalesSummaryByBuyerPDF = (
  data: InventoryItem[],
  filters: BuyerReportFilters
) => {
  if (!filters.stationId || !filters.dateFrom || !filters.dateTo) {
    alert("Please select station ID and date range.");
    return;
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0");
    if (price <= 0) return false;

    const matchesStation = item.stationId === filters.stationId;
    const matchesTobaccoType =
      !filters.tobaccoType || item.tobaccoType === filters.tobaccoType;

    const matchesDateRange = isDateInRange(item.dateFormated, filters.dateFrom, filters.dateTo);

    return matchesStation && matchesTobaccoType && matchesDateRange;
  });

  if (filteredData.length === 0) {
    alert("No records found for the selected station and date range.");
    return;
  }

  // Get tobacco types for this station
  const tobaccoTypes =
    [...new Set(filteredData.map((item) => item.tobaccoType))].join(" (") + ")";

  // Group data by buyer
  const buyerSummary = filteredData.reduce((acc, item) => {
    const buyerId = item.buyerId;

    if (!acc[buyerId]) {
      acc[buyerId] = {
        buyerId,
        barcodes: new Set(),
        totalWeight: 0,
        totalValue: 0,
      };
    }

    if (item.barcodeId) {
      acc[buyerId].barcodes.add(item.barcodeId);
    }

    acc[buyerId].totalWeight += Number.parseFloat(item.weight || "0");

    const price = Number.parseFloat(item.price);
    const weight = Number.parseFloat(item.weight || "0");
    acc[buyerId].totalValue += price * weight;

    return acc;
  }, {} as Record<string, any>);

  const buyerArray = Object.values(buyerSummary).map((buyer: any) => ({
    ...buyer,
    noOfBales: buyer.barcodes.size,
    // Average Price = Total Value / Total Weight
    averagePrice:
      buyer.totalWeight > 0
        ? (buyer.totalValue / buyer.totalWeight).toFixed(2)
        : "0.00",
  }));

  // Sort by total value descending
  buyerArray.sort((a, b) => b.totalValue - a.totalValue);

  const totals = buyerArray.reduce(
    (acc, buyer) => ({
      noOfBales: acc.noOfBales + buyer.noOfBales,
      totalWeight: acc.totalWeight + buyer.totalWeight,
      totalValue: acc.totalValue + buyer.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 }
  );

  const doc = new jsPDF();
  let currentY = addCompanyHeader(doc, "Sales Summary by Buyer");

  // Station and period info (matching your format)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text(`Station ID: ${filters.stationId}`, 20, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tobacco Type: ${tobaccoTypes}`, 20, currentY);
  currentY += 6;

  doc.text(
    `Date (From - To): ${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} - ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    20,
    currentY
  );
  currentY += 15;

  // Buyers and Sales Data header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  currentY += 10;

  const tableData = buyerArray.map((buyer) => [
    buyer.buyerId,
    "—",
    buyer.noOfBales.toString(),
    buyer.totalWeight.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    buyer.averagePrice,
    buyer.totalValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  ]);

  // Add totals row
  const overallAveragePrice =
    totals.totalWeight > 0
      ? (totals.totalValue / totals.totalWeight).toFixed(2)
      : "0.00";
  tableData.push([
    "TOTAL",
    "—",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    overallAveragePrice,
    totals.totalValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  ]);

  const headers = [
    "Buyer",
    "Company",
    "No. of Bales",
    "Weight (kg)",
    "Avg. Price ($/kg)",
    "Total Amount ($)",
  ];
  const columnWidths = [25, 25, 25, 30, 30, 35];

  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  // Add notes section
  currentY += (tableData.length + 2) * 8 + 20;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);

  currentY += 8;
  doc.save(
    `Station_${filters.stationId}_Buyer_Report_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};

export const exportToPDF = (data: InventoryItem[], filters: Filters) => {
  const dateRangeFilters: DateRangeFilters = {
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    stationId: filters.stationId,
    tobaccoType: filters.tobaccoType,
    farmerId: filters.farmerId,
    buyerId: filters.buyerId,
  };

  exportSalesSummaryByDatePDF(data, dateRangeFilters);
};

export const exportStationSummaryPDF = (
  data: InventoryItem[],
  filters: StationReportFilters
) => {
  const dateRangeFilters: DateRangeFilters = {
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    stationId: filters.stationId,
    tobaccoType: undefined,
    farmerId: "",
    buyerId: "",
  };

  exportSalesSummaryByDatePDF(data, dateRangeFilters);
};

export const exportSalesSummaryByDateRangePDF = (
  data: InventoryItem[],
  filters: DateBasedReportFilters
) => {
  if (!filters.dateFrom || !filters.dateTo || !filters.reportType) {
    alert("Please select date range and report type.");
    return;
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0");
    if (price <= 0) return false;

    const matchesStation =
      !filters.stationId || item.stationId === filters.stationId;
    const matchesTobaccoType =
      !filters.tobaccoType || item.tobaccoType === filters.tobaccoType;

    const matchesDateRange = isDateInRange(item.dateFormated, filters.dateFrom, filters.dateTo);

    return matchesStation && matchesTobaccoType && matchesDateRange;
  });

  if (filteredData.length === 0) {
    alert("No records found for the selected criteria.");
    return;
  }

  // Group data by date based on report type
  const summaryData = filteredData.reduce((acc, item) => {
    const groupKey = formatDateForGrouping(
      item.dateFormated,
      filters.reportType
    );

    if (!acc[groupKey]) {
      acc[groupKey] = {
        groupKey,
        barcodes: new Set(),
        totalWeight: 0,
        totalValue: 0,
        priceSum: 0,
        priceCount: 0,
      };
    }

    if (item.barcodeId) {
      acc[groupKey].barcodes.add(item.barcodeId);
    }

    acc[groupKey].totalWeight += Number.parseFloat(item.weight || "0");

    const price = Number.parseFloat(item.price);
    const weight = Number.parseFloat(item.weight || "0");
    acc[groupKey].totalValue += price * weight;
    acc[groupKey].priceSum += price;
    acc[groupKey].priceCount += 1;

    return acc;
  }, {} as Record<string, any>);

  const summaryArray = Object.values(summaryData).map((item: any) => ({
    ...item,
    noOfBales: item.barcodes.size,
    averagePrice:
      item.priceCount > 0
        ? (item.priceSum / item.priceCount).toFixed(2)
        : "0.00",
    displayDate: getDisplayDate(item.groupKey, filters.reportType),
  }));

  // Sort by group key
  summaryArray.sort((a, b) => {
    if (filters.reportType === "yearly" || filters.reportType === "monthly") {
      return a.groupKey.localeCompare(b.groupKey);
    } else {
      const dateA = normalizeDate(a.groupKey);
      const dateB = normalizeDate(b.groupKey);
      return dateA.getTime() - dateB.getTime();
    }
  });

  const totals = summaryArray.reduce(
    (acc, item) => ({
      noOfBales: acc.noOfBales + item.noOfBales,
      totalWeight: acc.totalWeight + item.totalWeight,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 }
  );

  const doc = new jsPDF();
  const reportTitle = `Sales Summary - ${
    filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)
  } Report`;
  let currentY = addCompanyHeader(doc, reportTitle);

  const reportInfo = {
    Period: `${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    Grouping:
      filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1),
    Station: filters.stationId || "ALL STATIONS",
    "Tobacco Type": filters.tobaccoType || "ALL TYPES",
    Generated: `${new Date().toLocaleDateString(
      "en-GB"
    )} ${new Date().toLocaleTimeString("en-GB")}`,
  };

  currentY = addReportInfo(doc, currentY, reportInfo);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: Only records with valid prices (> $0) are included in this summary",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  const tableData = summaryArray.map((item) => [
    item.displayDate,
    item.noOfBales.toString(),
    item.totalWeight.toFixed(2),
    item.averagePrice,
    item.totalValue.toFixed(2),
  ]);

  tableData.push([
    "GRAND TOTAL",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(2),
    "—",
    totals.totalValue.toFixed(2),
  ]);

  const periodLabel =
    filters.reportType === "daily"
      ? "Date"
      : filters.reportType === "monthly"
      ? "Month"
      : "Year";

  const headers = [
    "Date",
    "No. of Bales",
    "Weight (kg)",
    "Avg. Price ($)",
    "Total Value ($)",
  ];
  const columnWidths = [40, 30, 30, 30, 40];

  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  const filename = `Sales_Summary_${filters.reportType}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(filename);
};

export const exportDispatchDataPDF = async (dispatchbookNumber: string) => {
  alert("Export Dispatch Data to PDF functionality is not yet implemented.");
};

// 5. Sales Comprehensive Schedule PDF
// Define type for the aggregated data to be displayed in the table (copied from page.tsx)
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

export const exportSalesComprehensiveSchedulePDF = (
  data: AggregatedSale[], // Now accepts AggregatedSale[]
  filters: { stationId?: string; dateFrom: string; dateTo: string }
) => {
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.");
    return;
  }

  // Filter the aggregated data based on the modal's filters
  const filteredAggregatedData = data.filter((item) => {
    const itemDate = normalizeDate(item.saleDate);
    const fromDate = normalizeDate(filters.dateFrom);
    const toDate = normalizeDate(filters.dateTo);

    // Adjust dates to include the entire day for comparison
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const matchesDateRange = itemDate >= fromDate && itemDate <= toDate;
    const matchesStation =
      !filters.stationId || item.station === filters.stationId;

    return matchesDateRange && matchesStation;
  });

  if (filteredAggregatedData.length === 0) {
    alert("No records found for the selected criteria.");
    return;
  }

  const doc = new jsPDF("landscape"); // Keep landscape for potentially wide tables
  let currentY = addCompanyHeader(doc, "Sales Comprehensive Schedule");

  const reportInfo = {
    Period: `${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    Station: filters.stationId || "ALL STATIONS",
    Generated: `${new Date().toLocaleDateString(
      "en-GB"
    )} ${new Date().toLocaleTimeString("en-GB")}`,
  };

  currentY = addReportInfo(doc, currentY, reportInfo);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: This schedule is based on aggregated sales data.",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  const tableHeaders = [
    "Sale Date",
    "Farmer ID",
    "Farmer Name",
    "Station",
    "Bales",
    "Total Weight (kg)",
    "Total Sales ($)",
    "Commission ($)",
    "Loans ($)",
    "Net Pay ($)",
  ];

  // Calculate totals for the summary row
  const totals = filteredAggregatedData.reduce(
    (acc, sale) => {
      acc.numberOfBales += sale.numberOfBales;
      acc.totalWeight += sale.totalWeight;
      acc.totalSales += sale.totalSales;
      acc.totalCommission += sale.totalCommission;
      acc.totalLoans += sale.totalLoans;
      acc.netPay += sale.netPay;
      return acc;
    },
    {
      numberOfBales: 0,
      totalWeight: 0,
      totalSales: 0,
      totalCommission: 0,
      totalLoans: 0,
      netPay: 0,
    }
  );

  const tableData = filteredAggregatedData.map((sale) => [
    sale.saleDate,
    sale.farmerId,
    sale.farmerName,
    sale.station,
    sale.numberOfBales.toString(),
    sale.totalWeight.toFixed(2),
    sale.totalSales.toFixed(2),
    sale.totalCommission.toFixed(2),
    sale.totalLoans.toFixed(2),
    sale.netPay.toFixed(2),
  ]);

  // Add totals row
  tableData.push([
    "GRAND TOTAL",
    "", // Farmer ID
    "", // Farmer Name
    "", // Station
    totals.numberOfBales.toString(),
    totals.totalWeight.toFixed(2),
    totals.totalSales.toFixed(2),
    totals.totalCommission.toFixed(2),
    totals.totalLoans.toFixed(2),
    totals.netPay.toFixed(2),
  ]);

  // Adjust column widths for landscape A4 (297mm wide, 20mm margins = 257mm usable)
  const columnWidths = [
    25, // Sale Date
    20, // Farmer ID
    35, // Farmer Name
    25, // Station
    15, // Bales
    25, // Total Weight (kg)
    25, // Total Sales ($)
    25, // Commission ($)
    20, // Loans ($)
    25, // Net Pay ($)
  ];

  currentY = addSimpleTable(doc, tableHeaders, tableData, currentY, columnWidths);
  currentY += 5; // Add some space after the table

  doc.save(
    `Sales_Comprehensive_Schedule_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

// 4. Sales Summary by Farmer
export const exportSalesSummaryByFarmerPDF = (
  data: InventoryItem[],
  filters: FarmerReportFilters
) => {
  
  if (!filters.dateFrom || !filters.dateTo) {
    alert("Please select both start and end dates.");
    return;
  }

  const filteredData = data.filter((item) => {
    const price = Number.parseFloat(item.price || "0");
    if (price <= 0) {
      return false;
    }

    // Filter by Farmer ID if specified
    const matchesFarmerId =
      !filters.farmerId || item.farmerId === filters.farmerId;
    
    // Filter by Buyer ID if specified
    const matchesBuyerId =
      !filters.buyerId || item.buyerId === filters.buyerId;
    
    // Filter by Tobacco Type if specified
    const matchesTobaccoType =
      !filters.tobaccoType || item.tobaccoType === filters.tobaccoType;

    // Get date from item - try valid date fields
    const itemDate = item.dateFormated || item.date;
    if (!itemDate) {
      return false;
    }

    // Filter by Date Range using the new helper function
    let matchesDateRange;
    try {
      matchesDateRange = isDateInRange(itemDate, filters.dateFrom, filters.dateTo);
    } catch (error) {
      console.error('Error comparing dates:', error, {
        itemDate,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        item: item.barcodeId
      });
      return false;
    }

    const shouldInclude = matchesFarmerId && matchesBuyerId && matchesTobaccoType && matchesDateRange;
    
    return shouldInclude;
  });

  if (filteredData.length === 0) {
    alert("No records found for the selected criteria.");
    return;
  }

  // Group data by farmer
  const farmerSummary = filteredData.reduce((acc, item) => {
    const farmerId = item.farmerId;

    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerId,
        barcodes: new Set(),
        totalWeight: 0,
        totalValue: 0,
        priceSum: 0,
        priceCount: 0,
        buyers: new Set(),
        tobaccoTypes: new Set(),
      };
    }

    if (item.barcodeId) {
      acc[farmerId].barcodes.add(item.barcodeId);
    }

    acc[farmerId].totalWeight += Number.parseFloat(item.weight || "0");

    const price = Number.parseFloat(item.price);
    const weight = Number.parseFloat(item.weight || "0");
    acc[farmerId].totalValue += price * weight;
    acc[farmerId].priceSum += price;
    acc[farmerId].priceCount += 1;
    
    // Track buyers and tobacco types for this farmer
    acc[farmerId].buyers.add(item.buyerId);
    acc[farmerId].tobaccoTypes.add(item.tobaccoType);

    return acc;
  }, {} as Record<string, any>);

  const farmerArray = Object.values(farmerSummary).map((farmer: any) => ({
    ...farmer,
    noOfBales: farmer.barcodes.size,
    averagePrice:
      farmer.priceCount > 0
        ? (farmer.priceSum / farmer.priceCount).toFixed(2)
        : "0.00",
    buyersList: Array.from(farmer.buyers).join(", "),
    tobaccoTypesList: Array.from(farmer.tobaccoTypes).join(", "),
  }));

  // Sort by farmer ID
  farmerArray.sort((a, b) => a.farmerId.localeCompare(b.farmerId));

  const totals = farmerArray.reduce(
    (acc, item) => ({
      noOfBales: acc.noOfBales + item.noOfBales,
      totalWeight: acc.totalWeight + item.totalWeight,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { noOfBales: 0, totalWeight: 0, totalValue: 0 }
  );

  const doc = new jsPDF();
  let currentY = addCompanyHeader(doc, "Farmers Detailed Statement");

  const reportInfo = {
    Period: `${new Date(filters.dateFrom).toLocaleDateString(
      "en-GB"
    )} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`,
    "Farmer ID": filters.farmerId || "ALL FARMERS",
    "Buyer ID": filters.buyerId || "ALL BUYERS",
    "Tobacco Type": filters.tobaccoType || "ALL TYPES",
    Generated: `${new Date().toLocaleDateString(
      "en-GB"
    )} ${new Date().toLocaleTimeString("en-GB")}`,
  };

  currentY = addReportInfo(doc, currentY, reportInfo);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: Only records with valid prices (> $0) are included in this detailed statement",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  const tableData = farmerArray.map((farmer) => [
    farmer.farmerId,
    farmer.noOfBales.toString(),
    farmer.totalWeight.toFixed(2),
    farmer.averagePrice,
    farmer.totalValue.toFixed(2),
  ]);

  tableData.push([
    "GRAND TOTAL",
    totals.noOfBales.toString(),
    totals.totalWeight.toFixed(2),
    "—",
    totals.totalValue.toFixed(2),
  ]);

  const headers = [
    "Farmer ID",
    "No. of Bales",
    "Weight (kg)",
    "Avg. Price ($)",
    "Total Value ($)",
  ];
  const columnWidths = [40, 30, 30, 30, 40];

  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  doc.save(
    `Farmers_Detailed_Statement_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

export const exportFilteredInventoryToPDF = (
  data: InventoryItem[],
  filters: Filters
) => {
  if (data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => {
      // Count unique barcodes
      if (item.barcodeId) {
        acc.uniqueBarcodes.add(item.barcodeId);
      }
      
      // Sum weight
      acc.totalWeight += Number.parseFloat(item.weight || "0");
      
      // Sum USD Value (price * weight)
      const price = Number.parseFloat(item.price || "0");
      const weight = Number.parseFloat(item.weight || "0");
      if (price > 0 && weight > 0) {
        acc.totalUSDValue += price * weight;
      }
      
      return acc;
    },
    {
      uniqueBarcodes: new Set<string>(),
      totalWeight: 0,
      totalUSDValue: 0,
    }
  );

  const doc = new jsPDF();
  let currentY = addCompanyHeader(doc, "Filtered Inventory Report");

  // Build filter info following the farmer report pattern
  const reportInfo: { [key: string]: string } = {};
  
  if (filters.dateFrom && filters.dateTo) {
    reportInfo["Period"] = `${new Date(filters.dateFrom).toLocaleDateString("en-GB")} to ${new Date(filters.dateTo).toLocaleDateString("en-GB")}`;
  } else if (filters.dateFrom) {
    reportInfo["Date From"] = new Date(filters.dateFrom).toLocaleDateString("en-GB");
  } else if (filters.dateTo) {
    reportInfo["Date To"] = new Date(filters.dateTo).toLocaleDateString("en-GB");
  }
  
  reportInfo["Farmer ID"] = filters.farmerId || "ALL FARMERS";
  reportInfo["Buyer ID"] = filters.buyerId || "ALL BUYERS";
  reportInfo["Station ID"] = filters.stationId || "ALL STATIONS";
  reportInfo["Tobacco Type"] = filters.tobaccoType || "ALL TYPES";
  
  if (filters.search) {
    reportInfo["Search Filter"] = filters.search;
  }
  
  reportInfo["Total Records"] = data.length.toString();
  reportInfo["Generated"] = `${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`;

  currentY = addReportInfo(doc, currentY, reportInfo);

  // Add note following the farmer report pattern
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(127, 140, 141);
  doc.text(
    "Note: This report shows all filtered inventory records with detailed breakdown",
    doc.internal.pageSize.width / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10;

  // Headers - exactly 7 columns
  const headers = [
    "Barcode ID",
    "Farmer ID",
    "Station ID", 
    "Buyer ID",
    "Weight (kg)",
    "Price ($)",
    "Total Value ($)",
  ];

  // Prepare table data - exactly 7 columns to match headers
  const tableData = data.map((item) => {
    const price = Number.parseFloat(item.price || "0");
    const weight = Number.parseFloat(item.weight || "0");
    const usdValue = price > 0 && weight > 0 ? (price * weight).toFixed(2) : "0.00";

    return [
      item.barcodeId || "-",           // Column 1: Barcode ID
      item.farmerId || "-",            // Column 2: Farmer ID
      item.stationId || "-",           // Column 3: Station ID
      item.buyerId || "-",             // Column 4: Buyer ID
      (weight || 0).toFixed(2),        // Column 5: Weight (kg)
      (price || 0).toFixed(2),         // Column 6: Price ($)
      usdValue,                        // Column 7: Total Value ($)
    ];
  });

  // Add grand total row - exactly 7 columns to match headers
  tableData.push([
    "GRAND TOTAL",                     // Column 1
    `${totals.uniqueBarcodes.size} Barcodes`, // Column 2
    "—",                               // Column 3
    "—",                               // Column 4
    totals.totalWeight.toFixed(2),     // Column 5
    "—",                               // Column 6
    totals.totalUSDValue.toFixed(2),   // Column 7
  ]);

  // Column widths - exactly 7 widths to match headers
  const columnWidths = [30, 25, 25, 25, 25, 25, 25];

  // Use the same table rendering as farmer report
  addSimpleTable(doc, headers, tableData, currentY, columnWidths);

  // Generate filename following the farmer report pattern
  let filename = "Filtered_Inventory_Report";
  if (filters.stationId) filename += `_Station_${filters.stationId}`;
  if (filters.buyerId) filename += `_Buyer_${filters.buyerId}`;
  if (filters.farmerId) filename += `_Farmer_${filters.farmerId}`;
  if (filters.dateFrom) filename += `_From_${filters.dateFrom}`;
  filename += `_${new Date().toISOString().split("T")[0]}.pdf`;

  doc.save(filename);
};
