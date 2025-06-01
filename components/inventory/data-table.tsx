"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import type { InventoryItem, SortConfig } from "@/types/inventory"

interface DataTableProps {
  data: InventoryItem[]
  visibleColumns: Record<string, boolean>
  sortConfig: SortConfig
  handleSort: (key: keyof InventoryItem) => void
  clearFilters: () => void
}

export function InventoryDataTable({ data, visibleColumns, sortConfig, handleSort, clearFilters }: DataTableProps) {
  // Check if row has missing data
  const hasMissingData = (item: InventoryItem) => {
    return !item.price || !item.grade
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-8 sm:py-12 px-4">
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Records Match Your Filters</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              Try adjusting your search criteria or clearing some filters to see more results.
            </p>
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.barcodeId && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[120px]"
                    onClick={() => handleSort("barcodeId")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Barcode ID</span>
                      {sortConfig.key === "barcodeId" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.weight && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[80px]"
                    onClick={() => handleSort("weight")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Weight</span>
                      {sortConfig.key === "weight" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.farmerId && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[100px]"
                    onClick={() => handleSort("farmerId")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Farmer ID</span>
                      {sortConfig.key === "farmerId" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stationId && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[100px]"
                    onClick={() => handleSort("stationId")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Station ID</span>
                      {sortConfig.key === "stationId" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.buyerId && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[100px]"
                    onClick={() => handleSort("buyerId")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Buyer ID</span>
                      {sortConfig.key === "buyerId" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.registra && (
                  <TableHead className="min-w-[100px] text-xs sm:text-sm">Registrar</TableHead>
                )}
                {visibleColumns.lotNumber && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[100px]"
                    onClick={() => handleSort("lotNumber")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Lot Number</span>
                      {sortConfig.key === "lotNumber" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.grade && <TableHead className="min-w-[80px] text-xs sm:text-sm">Grade</TableHead>}
                {visibleColumns.price && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[80px]"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Price</span>
                      {sortConfig.key === "price" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                <TableHead className="min-w-[100px] text-xs sm:text-sm">USD Value</TableHead>
                {visibleColumns.tobaccoType && (
                  <TableHead className="min-w-[120px] text-xs sm:text-sm">Tobacco Type</TableHead>
                )}
                {visibleColumns.dateFormated && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 min-w-[100px]"
                    onClick={() => handleSort("dateFormated")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm">Date</span>
                      {sortConfig.key === "dateFormated" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        ))}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.dispatchId && (
                  <TableHead className="min-w-[120px] text-xs sm:text-sm">Dispatch ID</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item._id}
                  className={`hover:bg-gray-50 ${hasMissingData(item) ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""}`}
                >
                  {visibleColumns.barcodeId && (
                    <TableCell className="font-mono text-xs sm:text-sm">
                      {item.barcodeId || <span className="text-gray-400">-</span>}
                    </TableCell>
                  )}
                  {visibleColumns.weight && <TableCell className="text-xs sm:text-sm">{item.weight} kg</TableCell>}
                  {visibleColumns.farmerId && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.farmerId}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.stationId && <TableCell className="text-xs sm:text-sm">{item.stationId}</TableCell>}
                  {visibleColumns.buyerId && (
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {item.buyerId}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.registra && <TableCell className="text-xs sm:text-sm">{item.registra}</TableCell>}
                  {visibleColumns.lotNumber && <TableCell className="text-xs sm:text-sm">{item.lotNumber}</TableCell>}
                  {visibleColumns.grade && (
                    <TableCell>
                      {item.grade ? (
                        <Badge variant="default" className="text-xs">
                          {item.grade}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs">Missing</span>
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.price && (
                    <TableCell>
                      {item.price ? (
                        <span className="font-semibold text-xs sm:text-sm">${item.price}</span>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs">Missing</span>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {item.price && item.weight ? (
                      <span className="font-bold text-green-600 text-xs sm:text-sm">
                        ${(Number.parseFloat(item.price) * Number.parseFloat(item.weight)).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  {visibleColumns.tobaccoType && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.tobaccoType}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.dateFormated && (
                    <TableCell className="text-xs sm:text-sm">{item.dateFormated}</TableCell>
                  )}
                  {visibleColumns.dispatchId && (
                    <TableCell className="font-mono text-xs sm:text-sm">
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
