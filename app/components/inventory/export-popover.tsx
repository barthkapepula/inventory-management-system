"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Download, FileText, Users, Calendar, ChevronDown, UserCheck } from "lucide-react";

interface ExportPopoverProps {
  exportToExcel: () => void;
  exportToPDF: () => void;
  openStationModal: () => void;
  openBuyerModal: () => void;
  openSalesDateModal: () => void;
  openStationSummaryModal: () => void;
  openFarmerModal: () => void;
  openSalesComprehensiveModal: () => void;
}

export function ExportPopover({
  exportToExcel,
  exportToPDF,
  openStationModal,
  openBuyerModal,
  openSalesDateModal,
  openStationSummaryModal,
  openFarmerModal,
  openSalesComprehensiveModal,
}: ExportPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleModalOpen = (openFn: () => void) => {
    setIsOpen(false);
    openFn();
  };

  const handleFarmerClick = () => {
    console.log("Farmer button clicked");
    handleModalOpen(openFarmerModal);
  };

  const handleDispatchClick = () => {
    setIsOpen(false);
    router.push('/dispatch');
  };

  const handleSalesComprehensiveClick = () => {
    setIsOpen(false);
    router.push('/sales-comprehensive');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export Options</span>
          <span className="sm:hidden">Export</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-700 border-b">
            Export Options
          </div>
          
          <Button
            onClick={handleSalesComprehensiveClick}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Sales Comprehensive</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                View comprehensive sales data
              </div>
            </div>
          </Button>

          <Button
            onClick={handleDispatchClick}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Dispatch Management</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                Manage and generate dispatch documents
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleModalOpen(openStationSummaryModal)}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Sales Summary by All Stations</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                All stations by date & type
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleModalOpen(openBuyerModal)}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <Users className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Sales Summary by All Buyers</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                Sales summary by all buyers
              </div>
            </div>
          </Button>

          <Button
            onClick={handleFarmerClick}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <UserCheck className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Farmers Sales Detailed Statement</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                Detailed sales report for farmers
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleModalOpen(openSalesDateModal)}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto py-3 px-3"
          >
            <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">Sales Summary by Sales Dates</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                Summary grouped by sales dates
              </div>
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
// This component provides a popover menu for exporting data in various formats
