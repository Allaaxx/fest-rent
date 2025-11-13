"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Account Created!</CardTitle>
          <CardDescription>Welcome to Fest Marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <p className="text-slate-300">
            Your account has been created successfully. Please check your email to verify your account.
          </p>
          <div className="space-y-2">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Login</Button>
            </Link>
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full border-slate-400 text-white hover:bg-slate-700 bg-transparent"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
