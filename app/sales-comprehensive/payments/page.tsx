import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PaymentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-50">Connecting to Bank...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 dark:border-gray-50"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please wait while we securely connect you to your bank for payment processing.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This is a simulation. In a real application, you would be redirected to a secure payment gateway.
          </p>
          <Link href="/" passHref>
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
