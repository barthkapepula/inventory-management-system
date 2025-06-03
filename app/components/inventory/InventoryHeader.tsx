"use client";

import { ExportPopover } from "./export-popover";

interface HeaderProps {
  exportToExcel: () => void;
  exportToPDF: () => void;
  openStationModal: () => void;
  openBuyerModal: () => void;
  openSalesDateModal: () => void;
  openStationSummaryModal: () => void;
}

export function InventoryHeader({
  exportToExcel,
  exportToPDF,
  openStationModal,
  openBuyerModal,
  openSalesDateModal,
  openStationSummaryModal,
}: HeaderProps) {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tobacco Inventory Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and track tobacco inventory records
        </p>
      </div>
      <div className="flex gap-2">
        <ExportPopover
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
          openStationModal={openStationModal}
          openBuyerModal={openBuyerModal}
          openSalesDateModal={openSalesDateModal}
          openStationSummaryModal={openStationSummaryModal}
        />
      </div>
    </div>
  );
}
