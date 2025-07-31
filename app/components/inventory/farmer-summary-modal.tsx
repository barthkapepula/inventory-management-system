"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

function normalizeDate(dateString: string | Date): Date {
  // If already a Date object, return it
  if (dateString instanceof Date) return dateString
  
  // Try parsing as ISO string first
  const isoDate = new Date(dateString)
  if (!isNaN(isoDate.getTime())) return isoDate
  
  // Try parsing as formatted string (e.g. "Thu Jul 31 2025 06:57:49 GMT+0200")
  const formattedDate = new Date(dateString)
  if (!isNaN(formattedDate.getTime())) return formattedDate
  
  // Fallback to current date if parsing fails
  return new Date()
}
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
    farmerId: "",
    buyerId: "",
  } as FarmerReportFilters);

  // Farmer ID search states
  const [farmerOpen, setFarmerOpen] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [showFarmerOptions, setShowFarmerOptions] = useState(false);

  // Buyer ID search states
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [showBuyerOptions, setShowBuyerOptions] = useState(false);

  // Get unique values for dropdowns
  const uniqueTobaccoTypes = [...new Set(data.map((item) => item.tobaccoType))].sort();
  const uniqueFarmerIds = [...new Set(data.map((item) => item.farmerId))].sort();
  const uniqueBuyerIds = [...new Set(data.map((item) => item.buyerId))].sort();

  const handleExport = () => {
    if (!filters.dateFrom) {
      alert("Please select a date.");
      return;
    }

    // Normalize dates for consistent comparison
    const normalizedDate = normalizeDate(filters.dateFrom);
    const dateString = normalizedDate.toISOString().split('T')[0];

    // Set dateTo to the same as dateFrom for single date filtering
    const singleDateFilters = {
      ...filters,
      dateFrom: dateString,
      dateTo: dateString
    };

    console.log('Exporting with filters:', singleDateFilters);
    exportSalesSummaryByFarmerPDF(data, singleDateFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      stationId: "",
      tobaccoType: "",
      farmerId: "",
      buyerId: "",
    });
    setFarmerSearch("");
    setShowFarmerOptions(false);
    setBuyerSearch("");
    setShowBuyerOptions(false);
  };

  // Farmer ID search handlers
  const handleFarmerSearch = (value: string) => {
    setFarmerSearch(value);
    if (value.trim() === "") {
      setShowFarmerOptions(false);
    }
  };

  const handleFarmerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowFarmerOptions(true);
    }
  };

  // Buyer ID search handlers
  const handleBuyerSearch = (value: string) => {
    setBuyerSearch(value);
    if (value.trim() === "") {
      setShowBuyerOptions(false);
    }
  };

  const handleBuyerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowBuyerOptions(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Farmers Detailed Statement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Single Date */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Select Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prevFilters) => ({ ...prevFilters, dateFrom: e.target.value }))
              }
            />
          </div>

          {/* Farmer ID Search */}
          <div className="space-y-2">
            <Label>Farmer ID </Label>
            <Popover open={farmerOpen} onOpenChange={setFarmerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={farmerOpen}
                  className="w-full justify-between"
                >
                  {filters.farmerId || "Type farmer ID and press Enter to search"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Type farmer ID and press Enter..." 
                    value={farmerSearch}
                    onValueChange={handleFarmerSearch}
                    onKeyDown={handleFarmerKeyDown}
                  />
                  {!showFarmerOptions && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Type a farmer ID and press Enter to see matching options
                    </div>
                  )}
                  {showFarmerOptions && (
                    <>
                      <CommandEmpty>No farmer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilters((prevFilters) => ({ ...prevFilters, farmerId: "" }));
                            setFarmerOpen(false);
                            setFarmerSearch("");
                            setShowFarmerOptions(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.farmerId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Farmers
                        </CommandItem>
                        {uniqueFarmerIds
                          .filter(farmerId => 
                            farmerId.toLowerCase().includes(farmerSearch.toLowerCase())
                          )
                          .map((farmerId) => (
                            <CommandItem
                              key={farmerId}
                              value={farmerId}
                              onSelect={(currentValue) => {
                                setFilters((prevFilters) => ({
                                  ...prevFilters,
                                  farmerId: currentValue === prevFilters.farmerId ? "" : currentValue,
                                }));
                                setFarmerOpen(false);
                                setFarmerSearch("");
                                setShowFarmerOptions(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.farmerId === farmerId ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {farmerId}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Buyer ID Search */}
          <div className="space-y-2">
            <Label>Buyer ID (Optional)</Label>
            <Popover open={buyerOpen} onOpenChange={setBuyerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={buyerOpen}
                  className="w-full justify-between"
                >
                  {filters.buyerId || "Type buyer ID and press Enter to search"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Type buyer ID and press Enter..." 
                    value={buyerSearch}
                    onValueChange={handleBuyerSearch}
                    onKeyDown={handleBuyerKeyDown}
                  />
                  {!showBuyerOptions && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Type a buyer ID and press Enter to see matching options
                    </div>
                  )}
                  {showBuyerOptions && (
                    <>
                      <CommandEmpty>No buyer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilters((prevFilters) => ({ ...prevFilters, buyerId: "" }));
                            setBuyerOpen(false);
                            setBuyerSearch("");
                            setShowBuyerOptions(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.buyerId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Buyers
                        </CommandItem>
                        {uniqueBuyerIds
                          .filter(buyerId => 
                            buyerId.toLowerCase().includes(buyerSearch.toLowerCase())
                          )
                          .map((buyerId) => (
                            <CommandItem
                              key={buyerId}
                              value={buyerId}
                              onSelect={(currentValue) => {
                                setFilters((prevFilters) => ({
                                  ...prevFilters,
                                  buyerId: currentValue === prevFilters.buyerId ? "" : currentValue,
                                }));
                                setBuyerOpen(false);
                                setBuyerSearch("");
                                setShowBuyerOptions(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.buyerId === buyerId ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {buyerId}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tobacco Type */}
          <div className="space-y-2">
            <Label>Tobacco Type (Optional)</Label>
            <Select
              value={filters.tobaccoType}
              onValueChange={(value) =>
                setFilters((prevFilters) => ({ ...prevFilters, tobaccoType: value === "all" ? "" : value }))
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
            <strong>Note:</strong> This report will show detailed sales statement grouped by farmer ID, 
            including number of bales, total weight, average price, and total value for the selected date.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
