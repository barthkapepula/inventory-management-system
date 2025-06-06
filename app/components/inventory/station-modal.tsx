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
import type { StationReportFilters } from "./types";

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: StationReportFilters;
  setFilters: (filters: StationReportFilters) => void;
  onExport: () => void;
  uniqueStationIds: string[];
}

export function StationModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  onExport,
  uniqueStationIds,
}: StationModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setFilters({ stationId: "", dateFrom: "", dateTo: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Export Station Summary Report
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Station ID (Optional)
            </label>
            <Input
              type="text"
              id="stationId"
              value={filters.stationId}
              onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter station ID"
            />
            
            {/* Select dropdown (commented out)
            <Select
              value={filters.stationId}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  stationId: value === "all" ? "" : value,
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
              setFilters({ stationId: "", dateFrom: "", dateTo: "" });
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
