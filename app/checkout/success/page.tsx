"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your rental booking is confirmed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <p className="text-slate-300">
            Your payment has been processed successfully. Your equipment rental is now active.
          </p>
          <Link href="/dashboard">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
