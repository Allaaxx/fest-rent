"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Rental {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_value: number;
  status: string;
  stripe_payment_id?: string | null;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          throw userError;
        }

        setUser(
          userData || {
            id: authUser.id,
            email: authUser.email || "",
            name: authUser.user_metadata?.name || "",
            role: "renter",
          }
        );

        const { data: rentalsData, error: rentalsError } = await supabase
          .from("rentals")
          .select("*")
          .or(`renter_id.eq.${authUser.id},owner_id.eq.${authUser.id}`);

        if (rentalsError && rentalsError.code !== "PGRST116") {
          throw rentalsError;
        }

        setRentals(rentalsData || []);

        if (userData?.role === "vendor") {
          const { data: equipmentData, error: equipmentError } = await supabase
            .from("equipment")
            .select("*")
            .eq("owner_id", authUser.id);

          if (equipmentError && equipmentError.code !== "PGRST116") {
            throw equipmentError;
          }

          setEquipment(equipmentData || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <Spinner className="text-blue-500" />
      </div>
    );
  }

  const userRentals = rentals.filter((r) => r.renter_id === user?.id);
  const incomingRequests = rentals.filter(
    (r) => r.owner_id === user?.id && r.status === "pending"
  );
  const pendingCount = incomingRequests.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Fest
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/browse">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white"
              >
                Browse
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-slate-300 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name}</p>
        </div>

        <Tabs defaultValue="rentals" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="rentals" className="text-slate-300">
              My Rentals ({userRentals.length})
            </TabsTrigger>
            {user?.role === "vendor" && (
              <>
                <TabsTrigger value="requests" className="text-slate-300">
                  Requests ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="equipment" className="text-slate-300">
                  Equipment
                </TabsTrigger>
                <TabsTrigger value="earnings" className="text-slate-300">
                  Earnings
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="profile" className="text-slate-300">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rentals" className="space-y-4">
            {userRentals.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-300 mb-4">No rentals yet</p>
                  <Link href="/browse">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Equipment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userRentals.map((rental) => (
                  <Card
                    key={rental.id}
                    className="bg-slate-800 border-slate-700"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-slate-300">
                            {rental.start_date} to {rental.end_date}
                          </p>
                          <p className="text-2xl font-bold text-blue-400 mt-2">
                            ${rental.total_value.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          {(() => {
                            if (rental.status === "approved") {
                              if (rental.stripe_payment_id) {
                                return (
                                  <div className="text-yellow-300 font-semibold">
                                    Payment in progress
                                  </div>
                                );
                              }

                              return (
                                <Button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(
                                        "/api/stripe/checkout",
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            rentalId: rental.id,
                                          }),
                                        }
                                      );

                                      const payload = await res.json();
                                      if (!res.ok)
                                        throw new Error(
                                          payload?.error || "Checkout failed"
                                        );
                                      const url = payload.url;
                                      if (url) window.location.href = url;
                                    } catch (err) {
                                      alert(
                                        err instanceof Error
                                          ? err.message
                                          : String(err)
                                      );
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Pay
                                </Button>
                              );
                            }

                            if (rental.status === "completed") {
                              return (
                                <div className="text-green-400 font-semibold">
                                  Payment received
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            rental.status === "approved"
                              ? "bg-green-900/30 text-green-300"
                              : rental.status === "pending"
                              ? "bg-yellow-900/30 text-yellow-300"
                              : rental.status === "completed"
                              ? "bg-green-900/50 text-green-200"
                              : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {rental.status.charAt(0).toUpperCase() +
                            rental.status.slice(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {user?.role === "vendor" && (
            <>
              <TabsContent value="requests" className="space-y-4">
                {pendingCount === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-300">No pending requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <p className="text-slate-400 mb-4">
                      {pendingCount} pending rental request
                      {pendingCount !== 1 ? "s" : ""}
                    </p>
                    <Link href="/dashboard/rental-requests">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        View Requests
                      </Button>
                    </Link>
                  </>
                )}
              </TabsContent>

              <TabsContent value="equipment" className="space-y-4">
                <Link href="/dashboard/add-equipment">
                  <Button className="bg-blue-600 hover:bg-blue-700 mb-4">
                    Add Equipment
                  </Button>
                </Link>
                {equipment.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-300">No equipment listed yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {equipment.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-slate-800 border-slate-700"
                      >
                        <CardHeader>
                          <CardTitle className="text-white">
                            {item.name}
                          </CardTitle>
                          <CardDescription>{item.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-blue-400 font-bold">
                            ${item.price_per_day.toFixed(2)}/day
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <Link href="/dashboard/vendor-earnings">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Earnings
                  </Button>
                </Link>
              </TabsContent>
            </>
          )}

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-300 mb-1">Name</p>
                  <p className="text-slate-400">{user?.name}</p>
                </div>
                <div>
                  <p className="text-slate-300 mb-1">Email</p>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
                <div>
                  <p className="text-slate-300 mb-1">Account Type</p>
                  <p className="text-slate-400 capitalize">{user?.role}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
