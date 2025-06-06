import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { FileText } from "lucide-react";
import { StationReportFilters } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: StationReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<StationReportFilters>>;
  uniqueStationIds: string[];
  onExport: () => void;
}

export function StationModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  uniqueStationIds,
  onExport,
}: StationModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setFilters({ stationId: "", dateFrom: "", dateTo: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Export Station Summary Report
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Station ID (Optional)
            </label>
            <Select
              value={filters.stationId}
              onValueChange={(value: string) =>
                setFilters((prev) => ({
                  ...prev,
                  stationId: value === "all" ? "" : value,
                }))
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
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Date From *
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
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
                setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
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
