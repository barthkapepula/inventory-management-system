import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  const [progressMessage, setProgressMessage] = useState(message);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgressMessage("Please wait a bit...");
    }, 1500);
    const timer2 = setTimeout(() => {
      setProgressMessage("Almost done fetching...");
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Table Card Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-9 w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Table Header Skeleton */}
            <div className="border-b">
              <div className="flex">
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1 border-r" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
            
            {/* Table Rows Skeleton */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="border-b">
                <div className="flex">
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex-1 p-4 border-r">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex-1 p-4">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-9" />
            ))}
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* Loading Message */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">{progressMessage}</p>
        </div>
      </div>
    </div>
  );
}
