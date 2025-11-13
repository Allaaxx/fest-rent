"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

interface Equipment {
  id: string
  name: string
  category: string
  price_per_day: number
  available: boolean
  created_at: string
}

interface Rental {
  id: string
  start_date: string
  end_date: string
  total_value: number
  status: string
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (userError || userData?.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase.from("users").select("*")

        if (!usersError) setUsers(usersData || [])

        // Fetch all equipment
        const { data: equipmentData, error: equipmentError } = await supabase.from("equipment").select("*")

        if (!equipmentError) setEquipment(equipmentData || [])

        // Fetch all rentals
        const { data: rentalsData, error: rentalsError } = await supabase.from("rentals").select("*")

        if (!rentalsError) setRentals(rentalsData || [])
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Spinner className="text-blue-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-300">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Total Equipment", value: equipment.length },
    { label: "Total Rentals", value: rentals.length },
    { label: "Revenue", value: `$${rentals.reduce((sum, r) => sum + r.total_value, 0).toFixed(2)}` },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Fest
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="users" className="text-slate-300">
              Users
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-slate-300">
              Equipment
            </TabsTrigger>
            <TabsTrigger value="rentals" className="text-slate-300">
              Rentals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-600 text-slate-200 capitalize">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-400">${item.price_per_day.toFixed(2)}/day</p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                            item.available ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rentals.map((rental) => (
                    <div key={rental.id} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">
                          {rental.start_date} to {rental.end_date}
                        </p>
                        <p className="text-sm text-slate-400">ID: {rental.id.substring(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-400">${rental.total_value.toFixed(2)}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                            rental.status === "approved"
                              ? "bg-green-900/30 text-green-300"
                              : rental.status === "pending"
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
