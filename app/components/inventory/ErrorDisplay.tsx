import { Card, CardContent } from "@/app/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
}
// This component displays an error message in a styled card format
export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-96">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
