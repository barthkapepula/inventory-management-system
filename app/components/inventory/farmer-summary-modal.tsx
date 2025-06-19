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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Download, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, FarmerReportFilters } from "./types";
import { exportSalesSummaryByFarmerPDF } from "./exportUtils";

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

  const [stationOpen, setStationOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [showStationOptions, setShowStationOptions] = useState(false);

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
    setStationSearch("");
    setShowStationOptions(false);
  };

  const handleStationSearch = (value: string) => {
    setStationSearch(value);
    if (value.trim() === "") {
      setShowStationOptions(false);
    }
  };

  const handleStationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowStationOptions(true);
    }
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
            <Label>Station</Label>
            <Popover open={stationOpen} onOpenChange={setStationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={stationOpen}
                  className="w-full justify-between"
                >
                  {filters.stationId || "Type station ID and press Enter to search"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Type station ID and press Enter..." 
                    value={stationSearch}
                    onValueChange={handleStationSearch}
                    onKeyDown={handleStationKeyDown}
                  />
                  {!showStationOptions && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Type a station ID and press Enter to see matching options
                    </div>
                  )}
                  {showStationOptions && (
                    <>
                      <CommandEmpty>No station found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilters({ ...filters, stationId: "" });
                            setStationOpen(false);
                            setStationSearch("");
                            setShowStationOptions(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.stationId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Stations
                        </CommandItem>
                        {uniqueStations
                          .filter(station => 
                            station.toLowerCase().includes(stationSearch.toLowerCase())
                          )
                          .map((station) => (
                            <CommandItem
                              key={station}
                              value={station}
                              onSelect={(currentValue) => {
                                setFilters({ 
                                  ...filters, 
                                  stationId: currentValue === filters.stationId ? "" : currentValue 
                                });
                                setStationOpen(false);
                                setStationSearch("");
                                setShowStationOptions(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.stationId === station ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {station}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
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
