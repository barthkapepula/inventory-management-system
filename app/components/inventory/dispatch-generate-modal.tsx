"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportDispatchDataPDF } from "./exportDispatch";
import { toast } from "sonner";

interface DispatchRecord {
  barcodeId: string;
  driverName: string;
  destination: string;
  dispatchbookNumber: string;
  carRegistration: string;
  driverLicence: string;
  registra: string;
  date: string;
}

interface DispatchGenerateModalProps {
  dispatchData: DispatchRecord[];
  onClose: () => void;
}

export function DispatchGenerateModal({
  dispatchData,
  onClose,
}: DispatchGenerateModalProps) {
  const [dispatchbookNumber, setDispatchbookNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<DispatchRecord[]>([]);

  const handleInputChange = (value: string) => {
    setDispatchbookNumber(value);

    if (value.trim()) {
      const filtered = dispatchData.filter((record) =>
        record.dispatchbookNumber
          .toLowerCase()
          .includes(value.toLowerCase().trim())
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  };

  const handleGenerate = async () => {
    if (!dispatchbookNumber.trim()) {
      toast.success("Please enter a dispatch book number");
      return;
    }

    setIsLoading(true);
    try {
      // Get all records that match the dispatch book number
      const matchingRecords = dispatchData.filter(
        (record) =>
          record.dispatchbookNumber.toLowerCase() ===
          dispatchbookNumber.toLowerCase().trim()
      );

      if (matchingRecords.length === 0) {
        toast.success(
          `No dispatch records found for book number: ${dispatchbookNumber}`
        );
        return;
      }

      // Group records by dispatch book number and combine barcodes
      const groupedRecord = {
        ...matchingRecords[0], // Use first record for common data
        barcodeId: matchingRecords.map((record) => record.barcodeId).join(", "),
      };

      console.log("Generating PDF for:", groupedRecord);
      await exportDispatchDataPDF(groupedRecord);

      // Reset form and close modal after successful generation
      setDispatchbookNumber("");
      setFilteredRecords([]);
      onClose();
    } catch (error) {
      console.error("Error generating dispatch PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  // Get unique dispatch book numbers for suggestions
  const uniqueBookNumbers = [
    ...new Set(dispatchData.map((record) => record.dispatchbookNumber)),
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Generate Dispatch Document</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {dispatchData.length} dispatch records available
        </div>

        <div>
          <Label htmlFor="dispatchbookNumber">Dispatch Book Number</Label>
          <Input
            id="dispatchbookNumber"
            value={dispatchbookNumber}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter dispatch book number"
            disabled={isLoading}
          />
        </div>

        {filteredRecords.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Found {filteredRecords.length} record(s) for "{dispatchbookNumber}
              ":
            </p>
            <div className="space-y-1">
              {filteredRecords.slice(0, 3).map((record, index) => (
                <div key={index} className="text-xs text-gray-600">
                  Driver: {record.driverName} | Destination:{" "}
                  {record.destination}
                </div>
              ))}
              {filteredRecords.length > 3 && (
                <div className="text-xs text-gray-500">
                  ...and {filteredRecords.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !dispatchbookNumber.trim()}
          className="w-full"
        >
          {isLoading ? "Generating PDF..." : "Generate Dispatch PDF"}
        </Button>

        {uniqueBookNumbers.length > 0 && (
          <div className="text-xs text-gray-400">
            <p className="font-medium mb-1">Available book numbers:</p>
            <p>
              {uniqueBookNumbers.slice(0, 10).join(", ")}
              {uniqueBookNumbers.length > 10 &&
                ` and ${uniqueBookNumbers.length - 10} more...`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
