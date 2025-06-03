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

interface StationSummaryFilters {
  dateFrom: string;
  dateTo: string;
  tobaccoType: string;
}

interface StationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: StationSummaryFilters;
  setFilters: (filters: StationSummaryFilters) => void;
  onExport: () => void;
  uniqueTobaccoTypes: string[];
}

export function StationSummaryModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  onExport,
  uniqueTobaccoTypes,
}: StationSummaryModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setFilters({ dateFrom: "", dateTo: "", tobaccoType: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Export Summary by Station
        </h2>

        <div className="space-y-4">
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

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tobacco Type (Optional)
            </label>
            <Select
              value={filters.tobaccoType}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  tobaccoType: value === "all" ? "" : value,
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

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Note:</strong> This report will show a summary of all
            stations for the selected date range and tobacco type, including
            total bales, weight, and value per station.
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
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
