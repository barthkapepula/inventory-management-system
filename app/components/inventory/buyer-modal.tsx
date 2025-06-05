"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { BuyerReportFilters } from "./types";

interface BuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BuyerReportFilters;
  setFilters: (filters: BuyerReportFilters) => void;
  onExport: () => void;
  uniqueTobaccoTypes: string[];
  uniqueStationIds: string[];
}

export function BuyerModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  onExport,
  uniqueTobaccoTypes,
  uniqueStationIds,
}: BuyerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Export Sales Summary by Buyer
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="stationId" className="text-sm font-medium mb-2 block">
              Station ID (Optional)
            </label>
            <Input
              id="stationId"
              type="text"
              value={filters.stationId || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  stationId: e.target.value === "" ? undefined : e.target.value,
                })
              }
              placeholder="Enter station ID or leave empty for all"
            />
            
            {/* Select dropdown (commented out)
            <Select
              value={filters.stationId || ""}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  stationId: value === "all" ? undefined : value,
                })
              }
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
            */}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tobacco Type (Optional)
            </label>
            <Select
              value={filters.tobaccoType || ""}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  tobaccoType: value === "all" ? undefined : value,
                })
              }
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
            <label className="text-sm font-medium mb-2 block">
              Date From *
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date To *</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              required
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Note:</strong> This report will show a summary of all
            buyers' activities for the selected date range and filters,
            including total bales, weight, and value per buyer, sorted by total
            value.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            onClick={onExport}
            className="flex-1"
            disabled={!filters.dateFrom || !filters.dateTo}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={() => {
              onClose();
              setFilters({
                stationId: undefined,
                tobaccoType: undefined,
                dateFrom: "",
                dateTo: "",
              });
            }}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
