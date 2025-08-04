"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem } from "@/app/components/inventory/types";
import { exportSalesComprehensiveSchedulePDF } from "@/app/components/inventory/exportUtils";
import { AggregatedSale } from "@/app/sales-comprehensive/page"; // Import AggregatedSale type

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesData: AggregatedSale[]; // Change type to AggregatedSale[]
  uniqueStations: string[];
}

export function CreateScheduleModal({
  isOpen,
  onClose,
  salesData,
  uniqueStations,
}: CreateScheduleModalProps) {
  const [stationId, setStationId] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      // Reset filters when modal closes
      setStationId("All");
      setDateFrom(undefined);
      setDateTo(undefined);
    }
  }, [isOpen]);

  const handleExport = () => {
    if (!dateFrom || !dateTo) {
      alert("Please select both 'Date From' and 'Date To' for the schedule.");
      return;
    }

    exportSalesComprehensiveSchedulePDF(salesData, {
      stationId: stationId === "All" ? undefined : stationId,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Sales Schedule</DialogTitle>
          <DialogDescription>
            Filter sales data to create a schedule and export it as PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="station-select" className="text-right">
              Station
            </label>
            <Select value={stationId} onValueChange={setStationId}>
              <SelectTrigger id="station-select" className="col-span-3">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStations.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="date-from" className="text-right">
              Date From
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="date-to" className="text-right">
              Date To
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Filter and Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
