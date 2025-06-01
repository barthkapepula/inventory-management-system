"use client"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
<<<<<<< HEAD:app/components/inventory/InventoryPagination.tsx
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
=======
  setCurrentPage: (page: number) => void
>>>>>>> 4a9719d20eb78a722b80fb90d1da0085717b8085:components/inventory/pagination.tsx
}

export function InventoryPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
        {totalItems} results
      </div>
      <div className="flex gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="hidden sm:flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          })}
        </div>

        <div className="sm:hidden">
          <span className="text-sm text-gray-600">
            {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
