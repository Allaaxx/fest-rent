"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-white">Fest</div>
          <div className="flex gap-4">
            <Link href="/browse">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Browse Equipment
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Rent Event Equipment Easily</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Find and rent high-quality equipment for your corporate events, parties, and celebrations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/browse">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Browse Now
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-400 text-white hover:bg-slate-800 bg-transparent"
            >
              Become a Vendor
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Wide Selection</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Browse thousands of equipment options from verified vendors
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">All payments are securely processed through Stripe</CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Easy Booking</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Book equipment in minutes with our simple reservation system
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
