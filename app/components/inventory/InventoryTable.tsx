import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ChevronUp, ChevronDown, AlertTriangle, Download, FileText } from "lucide-react";
import { InventoryItem, SortConfig, VisibleColumns } from "./types";
import { hasMissingData } from "./utils";
import { exportToCSV } from "./exportUtils";
import jsPDF from "jspdf";

interface InventoryTableProps {
  data: InventoryItem[];
  sortConfig?: SortConfig;
  onSort?: (key: keyof InventoryItem) => void;
  visibleColumns: VisibleColumns;
}

// Helper function to export current table data to PDF
const exportTableToPDF = (data: InventoryItem[], visibleColumns: VisibleColumns) => {
  const doc = new jsPDF();
  
  // Add company header
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
  doc.text("INVENTORY TABLE EXPORT", doc.internal.pageSize.width / 2, 40, {
    align: "center",
  });

  doc.setDrawColor(52, 73, 94);
  doc.setLineWidth(0.5);
  doc.line(20, 45, doc.internal.pageSize.width - 20, 45);

  // Add report info
  let currentY = 55;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  doc.text("Generated:", 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`, 60, currentY);
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Total Records:", 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(data.length.toString(), 60, currentY);
  currentY += 10;

  // Create headers based on visible columns
  const headers: string[] = [];
  const columnKeys: (keyof InventoryItem)[] = [];
  
  if (visibleColumns.barcodeId) { headers.push("Barcode ID"); columnKeys.push("barcodeId"); }
  if (visibleColumns.weight) { headers.push("Weight"); columnKeys.push("weight"); }
  if (visibleColumns.farmerId) { headers.push("Farmer ID"); columnKeys.push("farmerId"); }
  if (visibleColumns.stationId) { headers.push("Station ID"); columnKeys.push("stationId"); }
  if (visibleColumns.buyerId) { headers.push("Buyer ID"); columnKeys.push("buyerId"); }
  if (visibleColumns.registra) { headers.push("Registrar"); columnKeys.push("registra"); }
  if (visibleColumns.lotNumber) { headers.push("Lot Number"); columnKeys.push("lotNumber"); }
  if (visibleColumns.grade) { headers.push("Grade"); columnKeys.push("grade"); }
  if (visibleColumns.price) { headers.push("Price"); columnKeys.push("price"); }
  headers.push("USD Value"); // Always include USD Value
  if (visibleColumns.tobaccoType) { headers.push("Tobacco Type"); columnKeys.push("tobaccoType"); }
  if (visibleColumns.dateFormated) { headers.push("Date"); columnKeys.push("dateFormated"); }
  if (visibleColumns.dispatchId) { headers.push("Dispatch ID"); columnKeys.push("dispatchId"); }

  // Calculate column widths
  const pageWidth = doc.internal.pageSize.width - 40;
  const columnWidth = pageWidth / headers.length;
  const columnWidths = new Array(headers.length).fill(columnWidth);

  // Create table data
  const tableData = data.map((item) => {
    const row: string[] = [];
    
    columnKeys.forEach((key) => {
      if (key === "weight" && item[key]) {
        row.push(`${item[key]} kg`);
      } else if (key === "price" && item[key]) {
        row.push(`$${item[key]}`);
      } else {
        row.push(item[key] || "-");
      }
    });

    // Add USD Value calculation
    const usdValue = item.price && item.weight
      ? (Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2)
      : "-";
    
    // Insert USD Value at the correct position (after price if visible, otherwise after grade)
    const usdValueIndex = visibleColumns.price 
      ? columnKeys.indexOf("price") + 1
      : (visibleColumns.grade ? columnKeys.indexOf("grade") + 1 : row.length);
    
    row.splice(usdValueIndex, 0, usdValue === "-" ? "-" : `$${usdValue}`);

    return row;
  });

  // Add simple table
  const startX = 20;
  const rowHeight = 6;
  let tableY = currentY;

  // Draw headers
  doc.setFillColor(236, 240, 241);
  doc.rect(startX, tableY, pageWidth, rowHeight, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);

  let headerX = startX + 2;
  headers.forEach((header, index) => {
    doc.text(header, headerX, tableY + 4);
    headerX += columnWidths[index];
  });

  doc.setDrawColor(189, 195, 199);
  doc.rect(startX, tableY, pageWidth, rowHeight);
  tableY += rowHeight;

  // Draw data rows (limit to fit on page)
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);

  const maxRows = Math.floor((doc.internal.pageSize.height - tableY - 20) / rowHeight);
  const displayData = tableData.slice(0, maxRows);

  displayData.forEach((row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(startX, tableY, pageWidth, rowHeight, "F");
    }

    let cellX = startX + 2;
    row.forEach((cell, cellIndex) => {
      const maxWidth = columnWidths[cellIndex] - 4;
      const truncatedCell = cell.length > 15 ? cell.substring(0, 12) + "..." : cell;
      doc.text(truncatedCell, cellX, tableY + 4);
      cellX += columnWidths[cellIndex];
    });

    doc.setDrawColor(189, 195, 199);
    doc.rect(startX, tableY, pageWidth, rowHeight);
    tableY += rowHeight;
  });

  // Add note if data was truncated
  if (tableData.length > maxRows) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(127, 140, 141);
    doc.text(
      `Note: Showing first ${maxRows} of ${tableData.length} records. Export to CSV for complete data.`,
      doc.internal.pageSize.width / 2,
      tableY + 10,
      { align: "center" }
    );
  }

  doc.save(`Inventory_Table_Export_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Helper function to export current table data to CSV
const exportTableToCSV = (data: InventoryItem[], visibleColumns: VisibleColumns) => {
  // Create headers based on visible columns
  const headers: string[] = [];
  
  if (visibleColumns.barcodeId) headers.push("Barcode ID");
  if (visibleColumns.weight) headers.push("Weight");
  if (visibleColumns.farmerId) headers.push("Farmer ID");
  if (visibleColumns.stationId) headers.push("Station ID");
  if (visibleColumns.buyerId) headers.push("Buyer ID");
  if (visibleColumns.registra) headers.push("Registrar");
  if (visibleColumns.lotNumber) headers.push("Lot Number");
  if (visibleColumns.grade) headers.push("Grade");
  if (visibleColumns.price) headers.push("Price");
  headers.push("USD Value"); // Always include USD Value
  if (visibleColumns.tobaccoType) headers.push("Tobacco Type");
  if (visibleColumns.dateFormated) headers.push("Date");
  if (visibleColumns.dispatchId) headers.push("Dispatch ID");

  const csvContent = [
    headers.join(","),
    ...data.map((item) => {
      const row: string[] = [];
      
      if (visibleColumns.barcodeId) row.push(`"${item.barcodeId || ""}"`);
      if (visibleColumns.weight) row.push(`"${item.weight}"`);
      if (visibleColumns.farmerId) row.push(`"${item.farmerId}"`);
      if (visibleColumns.stationId) row.push(`"${item.stationId}"`);
      if (visibleColumns.buyerId) row.push(`"${item.buyerId}"`);
      if (visibleColumns.registra) row.push(`"${item.registra}"`);
      if (visibleColumns.lotNumber) row.push(`"${item.lotNumber}"`);
      if (visibleColumns.grade) row.push(`"${item.grade || ""}"`);
      if (visibleColumns.price) row.push(`"${item.price || ""}"`);
      
      // USD Value calculation
      const usdValue = item.price && item.weight
        ? (Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2)
        : "";
      row.push(`"${usdValue}"`);
      
      if (visibleColumns.tobaccoType) row.push(`"${item.tobaccoType}"`);
      if (visibleColumns.dateFormated) row.push(`"${item.dateFormated}"`);
      if (visibleColumns.dispatchId) row.push(`"${item.dispatchId || ""}"`);

      return row.join(",");
    }),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Inventory_Table_Export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export function InventoryTable({
  data,
  sortConfig = { key: null, direction: "asc" },
  onSort = () => {},
  visibleColumns,
}: InventoryTableProps) {
  const renderSortableHeader = (key: keyof InventoryItem, label: string) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig.key === key &&
          (sortConfig.direction === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </div>
    </TableHead>
  );

  const handleCSVExport = () => {
    exportTableToCSV(data, visibleColumns);
  };

  const handlePDFExport = () => {
    exportTableToPDF(data, visibleColumns);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Inventory Data</h3>
            <Badge variant="secondary" className="text-xs">
              {data.length} records
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              
              size="sm"
              onClick={handleCSVExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              
              size="sm"
              onClick={handlePDFExport}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.barcodeId &&
                  renderSortableHeader("barcodeId", "Barcode ID")}
                {visibleColumns.weight &&
                  renderSortableHeader("weight", "Weight")}
                {visibleColumns.farmerId &&
                  renderSortableHeader("farmerId", "Farmer ID")}
                {visibleColumns.stationId &&
                  renderSortableHeader("stationId", "Station ID")}
                {visibleColumns.buyerId &&
                  renderSortableHeader("buyerId", "Buyer ID")}
                {visibleColumns.registra && <TableHead>Registrar</TableHead>}
                {visibleColumns.lotNumber &&
                  renderSortableHeader("lotNumber", "Lot Number")}
                {visibleColumns.grade && <TableHead>Grade</TableHead>}
                {visibleColumns.price && renderSortableHeader("price", "Price")}
                <TableHead>USD Value</TableHead>
                {visibleColumns.tobaccoType && (
                  <TableHead>Tobacco Type</TableHead>
                )}
                {visibleColumns.dateFormated &&
                  renderSortableHeader("dateFormated", "Date")}
                {visibleColumns.dispatchId && (
                  <TableHead>Dispatch ID</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} 
                    className="text-center py-8 text-gray-500"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow
                    key={item._id}
                    className={`hover:bg-gray-50 ${
                      hasMissingData(item)
                        ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                        : ""
                    }`}
                  >
                    {visibleColumns.barcodeId && (
                      <TableCell className="font-mono text-sm">
                        {item.barcodeId || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.weight && (
                      <TableCell>{item.weight} kg</TableCell>
                    )}
                    {visibleColumns.farmerId && (
                      <TableCell>
                        <Badge variant="outline">{item.farmerId}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.stationId && (
                      <TableCell>{item.stationId}</TableCell>
                    )}
                    {visibleColumns.buyerId && (
                      <TableCell>
                        <Badge variant="secondary">{item.buyerId}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.registra && (
                      <TableCell>{item.registra}</TableCell>
                    )}
                    {visibleColumns.lotNumber && (
                      <TableCell>{item.lotNumber}</TableCell>
                    )}
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
                          $
                          {(
                            Number.parseFloat(item.price) *
                            Number.parseFloat(item.weight)
                          ).toFixed(2)}
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
                    {visibleColumns.dateFormated && (
                      <TableCell>{item.dateFormated}</TableCell>
                    )}
                    {visibleColumns.dispatchId && (
                      <TableCell className="font-mono text-sm">
                        {item.dispatchId || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
