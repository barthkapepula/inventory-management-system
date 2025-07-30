"use client";

import { useState, useEffect, useMemo } from "react";
import { InventoryItem, Filters, SortConfig } from "./types";
import { getUniqueValues } from "./utils";

const ITEMS_PER_PAGE = 10;

export function useInventoryData() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    farmerId: "",
    buyerId: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    tobaccoType: "",
    stationId: "",
    registra: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://tobacco-management-system-server-98pz.onrender.com/api/v1/fetch/sale"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.message && Array.isArray(result.message)) {
          setData(result.message);
        } else {
          setData([]);
          setError("API returned no data or invalid format.");
        }
      } catch (err) {
        setError(
          `Failed to fetch inventory data: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique values for filter dropdowns
  const uniqueFarmerIds = useMemo(
    () => getUniqueValues(data, "farmerId"),
    [data]
  );
  const uniqueBuyerIds = useMemo(
    () => getUniqueValues(data, "buyerId"),
    [data]
  );
  const uniqueTobaccoTypes = useMemo(
    () => getUniqueValues(data, "tobaccoType"),
    [data]
  );
  const uniqueStationIds = useMemo(
    () => getUniqueValues(data, "stationId"),
    [data]
  );

  const uniqueRegistras = useMemo(
    () => getUniqueValues(data, "registra"),
    [data]
  );

  // Pagination (this will be based on filteredData from page.tsx)
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE); // Temporarily use raw data length
  const paginatedData = data.slice(
    // Temporarily use raw data
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle sorting (this will be handled in page.tsx)
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
    uniqueFarmerIds,
    uniqueBuyerIds,
    uniqueTobaccoTypes,
    uniqueStationIds,
    uniqueRegistras,
  };
}
