"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Download } from "lucide-react";
import { DispatchGenerateModal } from "../components/inventory/dispatch-generate-modal";
import axios from "axios";

interface DispatchRecord {
  _id: string;
  barcodeId: string;
  driverName: string;
  destination: string;
  dispatchbookNumber: string;
  carRegistration: string;
  driverLicence: string;
  registra: string;
  date: string;
  __v: number;
}

// API Response interface to handle different response structures
interface ApiResponse {
  data?: DispatchRecord[];
  message?: DispatchRecord[];
  records?: DispatchRecord[];
}

export default function DispatchPage() {
  const [dispatchData, setDispatchData] = useState<DispatchRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DispatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dispatch data on component mount
  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          "https://tobacco-management-system-server-98pz.onrender.com/api/v1/fetch/dispatch"
        );
        
        console.log("Full API Response:", response);
        console.log("Response data:", response.data);
        console.log("Response data type:", typeof response.data);
        console.log("Is response.data an array?", Array.isArray(response.data));
        
        // Handle different possible response structures
        let records: DispatchRecord[] = [];
        
        if (Array.isArray(response.data)) {
          // Direct array response
          records = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Object response - check common property names
          const apiResponse = response.data as ApiResponse;
          records = apiResponse.data || apiResponse.message || apiResponse.records || [];
          
          // If still empty, log all properties to see the structure
          if (records.length === 0) {
            console.log("Available properties in response.data:", Object.keys(response.data));
            console.log("Full response.data object:", response.data);
          }
        }
        
        console.log("Processed records:", records);
        console.log("Number of records:", records.length);
        
        if (records.length > 0) {
          console.log("Sample record:", records[0]);
        }
        
        setDispatchData(records);
        setFilteredData(records);
        console.log("Dispatch data loaded:", records.length, "records");
      } catch (error) {
        console.error("Error fetching dispatch data:", error);
        setError("Failed to load dispatch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  // Filter data based on search term
  useEffect(() => {
    if (!mounted) return;

    if (!searchTerm) {
      setFilteredData(dispatchData);
    } else {
      const filtered = dispatchData.filter(
        (record) =>
          record.dispatchbookNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.carRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.barcodeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, dispatchData, mounted]);

  const formatDate = (dateString: string): string => {
    if (!mounted || !dateString) return dateString || ""; // Return raw string during SSR
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString("en-GB");
    } catch (error) {
      return dateString || "";
    }
  };

  const handleRefresh = async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://tobacco-management-system-server-98pz.onrender.com/api/v1/fetch/dispatch"
      );
      
      // Use the same logic as in the initial fetch
      let records: DispatchRecord[] = [];
      
      if (Array.isArray(response.data)) {
        records = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const apiResponse = response.data as ApiResponse;
        records = apiResponse.data || apiResponse.message || apiResponse.records || [];
      }
      
      setDispatchData(records);
      setFilteredData(records);
      setError(null);
      console.log("Dispatch data refreshed:", records.length, "records");
    } catch (error) {
      console.error("Error refreshing dispatch data:", error);
      setError("Failed to refresh dispatch data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Show loading state during initial mount
  if (!mounted) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dispatch Management</h1>
            <p className="text-gray-600">Manage and generate dispatch documents</p>
          </div>
        </div>
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Management</h1>
          <p className="text-gray-600">Manage and generate dispatch documents</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            Refresh Data
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Dispatch Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DispatchGenerateModal 
                dispatchData={dispatchData}
                onClose={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dispatch Records</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by book number, driver, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dispatch data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button onClick={handleRefresh} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {Math.min(filteredData.length, itemsPerPage)} of {filteredData.length} records 
                {dispatchData.length !== filteredData.length && ` (filtered from ${dispatchData.length} total)`}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book No.</TableHead>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Driver Licence</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Car Registration</TableHead>
                      <TableHead>Barcode ID</TableHead>
                      <TableHead>Registrar</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((record, index) => (
                        <TableRow key={record._id || `${record.dispatchbookNumber}-${record.barcodeId}-${index}`}>
                          <TableCell className="font-medium">{record.dispatchbookNumber || 'N/A'}</TableCell>
                          <TableCell>{record.driverName || 'N/A'}</TableCell>
                          <TableCell>{record.driverLicence || 'N/A'}</TableCell>
                          <TableCell>{record.destination || 'N/A'}</TableCell>
                          <TableCell>{record.carRegistration || 'N/A'}</TableCell>
                          <TableCell className="font-mono text-sm">{record.barcodeId || 'N/A'}</TableCell>
                          <TableCell>{record.registra || 'N/A'}</TableCell>
                          <TableCell>{formatDate(record.date)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {searchTerm ? "No records match your search" : "No dispatch records found"}
                          {dispatchData.length === 0 && (
                            <div className="mt-2 text-sm">
                              <p>Debug info: API returned {dispatchData.length} records</p>
                              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                                Retry Loading
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredData.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
