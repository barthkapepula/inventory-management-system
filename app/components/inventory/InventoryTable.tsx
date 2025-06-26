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
import { ChevronUp, ChevronDown, AlertTriangle, FileText } from "lucide-react";
import { InventoryItem, SortConfig, VisibleColumns, Filters } from "./types";
import { hasMissingData } from "./utils";
import { exportFilteredInventoryToPDF } from "./exportUtils";

interface InventoryTableProps {
  data: InventoryItem[];                    // Current page data (paginated)
  allFilteredData?: InventoryItem[];        // ALL filtered data (not paginated) - OPTIONAL
  sortConfig?: SortConfig;
  onSort?: (key: keyof InventoryItem) => void;
  visibleColumns: VisibleColumns;
  filters?: Filters;
}

export function InventoryTable({
  data,
  allFilteredData = data,                   // Default to data if not provided
  sortConfig = { key: null, direction: "asc" },
  onSort = () => {},
  visibleColumns,
  filters = {},
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

  const handlePDFExport = () => {
    // Always use allFilteredData for export (all records, not just current page)
    exportFilteredInventoryToPDF(allFilteredData, filters as Filters);
  };

  // Ensure we have valid data arrays
  const displayData = data || [];                    // Current page data for display
  const totalFilteredData = allFilteredData || [];   // All filtered data for export count

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Inventory Data</h3>
            <Badge variant="secondary" className="text-xs">
              {displayData.length} of {totalFilteredData.length} records
            </Badge>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} 
                    className="text-center py-8 text-gray-500"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((item) => (
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
