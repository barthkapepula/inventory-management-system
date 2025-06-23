import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu"
import { Filter, Search, Eye } from "lucide-react"
import { Filters, VisibleColumns } from "./types"

interface InventoryFiltersProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  visibleColumns: VisibleColumns
  setVisibleColumns: React.Dispatch<React.SetStateAction<VisibleColumns>>
  uniqueFarmerIds: string[]
  uniqueBuyerIds: string[]
  uniqueTobaccoTypes: string[]
  uniqueStationIds: string[]
}

export function InventoryFilters({
  filters,
  setFilters,
  visibleColumns,
  setVisibleColumns,
  uniqueFarmerIds,
  uniqueBuyerIds,
  uniqueTobaccoTypes,
  uniqueStationIds,
}: InventoryFiltersProps) {
  const clearFilters = () => {
    setFilters({
      farmerId: "",
      buyerId: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      tobaccoType: "",
      stationId: "",
    })
  }

  return (
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
            <Input
              placeholder="Farmer ID"
              value={filters.farmerId}
              onChange={(e) => setFilters((prev) => ({ ...prev, farmerId: e.target.value }))}
            />
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

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              placeholder="Start date"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              placeholder="End date"
            />
          </div>

          {(filters.dateFrom || filters.dateTo) && (
            <div className="md:col-span-5 flex items-end">
              <p className="text-xs text-gray-500 mb-2">
                Date range: {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Start"} to{" "}
                {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "End"}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" size="sm" onClick={clearFilters}>
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
  )
}
