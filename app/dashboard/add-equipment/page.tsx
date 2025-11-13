"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CATEGORIES = ["Audio", "Video", "Lighting", "Tent", "Table", "Chair", "Decoration", "Other"]

export default function AddEquipmentPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!name || !category || !pricePerDay) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          price_per_day: Number.parseFloat(pricePerDay),
          image_url: imageUrl || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add equipment")
      }

      setSuccessMessage("Equipment added successfully!")
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add equipment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Fest
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Back to Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Equipment</CardTitle>
            <CardDescription>List a new equipment for rent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert className="bg-green-900/20 border-green-800">
                  <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Equipment Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Professional Microphone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your equipment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-200">
                    Price Per Day ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="150.00"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-slate-200">
                  Image URL
                </Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 py-6">
                {isLoading ? "Adding equipment..." : "Add Equipment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
