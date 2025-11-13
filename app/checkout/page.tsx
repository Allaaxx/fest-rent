"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard as checkout is handled by Stripe
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Processing Payment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Spinner className="text-blue-500" />
          <p className="text-slate-300">You will be redirected to complete your payment...</p>
        </CardContent>
      </Card>
    </div>
  )
}
