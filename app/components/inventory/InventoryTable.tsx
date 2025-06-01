import { Card, CardContent } from "@/app/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { ChevronUp, ChevronDown, AlertTriangle } from "lucide-react"
import { InventoryItem, SortConfig, VisibleColumns } from "./types"
import { hasMissingData } from "./utils"

interface InventoryTableProps {
  data: InventoryItem[]
  sortConfig?: SortConfig
  onSort?: (key: keyof InventoryItem) => void
  visibleColumns: VisibleColumns
}

export function InventoryTable({ 
  data, 
  sortConfig = { key: null, direction: "asc" }, 
  onSort = () => {}, 
  visibleColumns 
}: InventoryTableProps) {
  const renderSortableHeader = (key: keyof InventoryItem, label: string) => (
    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => onSort(key)}>
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
  )

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.barcodeId && renderSortableHeader("barcodeId", "Barcode ID")}
                {visibleColumns.weight && renderSortableHeader("weight", "Weight")}
                {visibleColumns.farmerId && renderSortableHeader("farmerId", "Farmer ID")}
                {visibleColumns.stationId && renderSortableHeader("stationId", "Station ID")}
                {visibleColumns.buyerId && renderSortableHeader("buyerId", "Buyer ID")}
                {visibleColumns.registra && <TableHead>Registrar</TableHead>}
                {visibleColumns.lotNumber && renderSortableHeader("lotNumber", "Lot Number")}
                {visibleColumns.grade && <TableHead>Grade</TableHead>}
                {visibleColumns.price && renderSortableHeader("price", "Price")}
                <TableHead>USD Value</TableHead>
                {visibleColumns.tobaccoType && <TableHead>Tobacco Type</TableHead>}
                {visibleColumns.dateFormated && renderSortableHeader("dateFormated", "Date")}
                {visibleColumns.dispatchId && <TableHead>Dispatch ID</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
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
  )
}
