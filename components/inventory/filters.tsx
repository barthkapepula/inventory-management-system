"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Filter, Search } from "lucide-react"
import type { Filters } from "@/types/inventory"

interface FiltersProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  uniqueFarmerIds: string[]
  uniqueBuyerIds: string[]
  uniqueTobaccoTypes: string[]
  uniqueStationIds: string[]
  visibleColumns: Record<string, boolean>
  setVisibleColumns: (columns: Record<string, boolean>) => void
}

export function InventoryFilters({
  filters,
  setFilters,
  uniqueFarmerIds,
  uniqueBuyerIds,
  uniqueTobaccoTypes,
  uniqueStationIds,
  visibleColumns,
  setVisibleColumns,
}: FiltersProps) {
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
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search all fields..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Farmer ID</label>
            <Select
              value={filters.farmerId}
              onValueChange={(value) => setFilters({ ...filters, farmerId: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Farmers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farmers</SelectItem>
                {uniqueFarmerIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Buyer ID</label>
            <Select
              value={filters.buyerId}
              onValueChange={(value) => setFilters({ ...filters, buyerId: value === "all" ? "" : value })}
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
              onValueChange={(value) => setFilters({ ...filters, tobaccoType: value === "all" ? "" : value })}
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
              onValueChange={(value) => setFilters({ ...filters, stationId: value === "all" ? "" : value })}
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

          <div>
            <label className="text-sm font-medium mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="Start date"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="End date"
            />
          </div>

          {(filters.dateFrom || filters.dateTo) && (
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-5 flex items-end">
              <p className="text-xs text-gray-500 mb-2">
                Date range: {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Start"} to{" "}
                {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "End"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
            Clear Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                  onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, [key]: checked })}
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
