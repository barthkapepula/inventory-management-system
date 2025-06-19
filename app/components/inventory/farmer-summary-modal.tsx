"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download } from "lucide-react";
import { InventoryItem, FarmerReportFilters } from "./types";
import {  exportSalesSummaryByFarmerPDF } from "./exportUtils";

interface FarmerSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InventoryItem[];
}

export function FarmerSummaryModal({
  isOpen,
  onClose,
  data,
}: FarmerSummaryModalProps) {
  console.log("FarmerSummaryModal rendered, isOpen:", isOpen); // Debug log
  
  const [filters, setFilters] = useState<FarmerReportFilters>({
    dateFrom: "",
    dateTo: "",
    stationId: "",
    tobaccoType: "",
  });

  // Get unique values for dropdowns
  const uniqueStations = [...new Set(data.map((item) => item.stationId))].sort();
  const uniqueTobaccoTypes = [...new Set(data.map((item) => item.tobaccoType))].sort();

  const handleExport = () => {
    if (!filters.dateFrom || !filters.dateTo) {
      alert("Please select both start and end dates.");
      return;
    }

    exportSalesSummaryByFarmerPDF(data, filters);
      onClose();
    };

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      stationId: "",
      tobaccoType: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Summary by Farmers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stationId">Station</Label>
            <Input
              id="stationId"
              type="text"
              value={filters.stationId}
              onChange={(e) =>
                setFilters({ ...filters, stationId: e.target.value })
              }
              placeholder="Enter station ID or leave empty for all"
            />
            
            {/* Select dropdown (commented out)
            <Select
              value={filters.stationId}
              onValueChange={(value) =>
                setFilters({ ...filters, stationId: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select station or leave empty for all" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {uniqueStations.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            */}
          </div>

          <div className="space-y-2">
            <Label>Tobacco Type (Optional)</Label>
            <Select
              value={filters.tobaccoType}
              onValueChange={(value) =>
                setFilters({ ...filters, tobaccoType: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tobacco type or leave empty for all" />
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

          <div className="flex gap-2 pt-4">
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Report
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> This report will show sales summary grouped by farmer ID, 
            including number of bales, total weight, average price, and total value for the selected period.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
