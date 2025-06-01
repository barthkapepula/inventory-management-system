export function InventoryLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inventory data...</p>
      </div>
    </div>
  )
}
