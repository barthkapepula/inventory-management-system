"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FileText, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [stationOpen, setStationOpen] = useState(false);
  const [tobaccoTypeOpen, setTobaccoTypeOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [tobaccoSearch, setTobaccoSearch] = useState("");
  const [showStationOptions, setShowStationOptions] = useState(false);
  const [showTobaccoOptions, setShowTobaccoOptions] = useState(false);

  if (!isOpen) return null;

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

  const handleTobaccoSearch = (value: string) => {
    setTobaccoSearch(value);
    if (value.trim() === "") {
      setShowTobaccoOptions(false);
    }
  };

  const handleTobaccoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowTobaccoOptions(true);
    }
  };

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
                            setFilters({ ...filters, stationId: undefined });
                            setStationOpen(false);
                            setStationSearch("");
                            setShowStationOptions(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !filters.stationId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Stations
                        </CommandItem>
                        {uniqueStationIds
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
                                  stationId: currentValue === filters.stationId ? undefined : currentValue 
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

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tobacco Type (Optional)
            </label>
            <Popover open={tobaccoTypeOpen} onOpenChange={setTobaccoTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tobaccoTypeOpen}
                  className="w-full justify-between"
                >
                  {filters.tobaccoType || "Type tobacco type and press Enter to search"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Type tobacco type and press Enter..." 
                    value={tobaccoSearch}
                    onValueChange={handleTobaccoSearch}
                    onKeyDown={handleTobaccoKeyDown}
                  />
                  {!showTobaccoOptions && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Type a tobacco type and press Enter to see matching options
                    </div>
                  )}
                  {showTobaccoOptions && (
                    <>
                      <CommandEmpty>No tobacco type found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilters({ ...filters, tobaccoType: undefined });
                            setTobaccoTypeOpen(false);
                            setTobaccoSearch("");
                            setShowTobaccoOptions(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !filters.tobaccoType ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Types
                        </CommandItem>
                        {uniqueTobaccoTypes
                          .filter(type => 
                            type.toLowerCase().includes(tobaccoSearch.toLowerCase())
                          )
                          .map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={(currentValue) => {
                                setFilters({ 
                                  ...filters, 
                                  tobaccoType: currentValue === filters.tobaccoType ? undefined : currentValue 
                                });
                                setTobaccoTypeOpen(false);
                                setTobaccoSearch("");
                                setShowTobaccoOptions(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.tobaccoType === type ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {type}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
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
              setStationSearch("");
              setTobaccoSearch("");
              setShowStationOptions(false);
              setShowTobaccoOptions(false);
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
