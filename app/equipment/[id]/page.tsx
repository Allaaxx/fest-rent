"use client";

import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  price_per_day: number;
  image_url: string | null;
  available: boolean;
  owner_id: string;
}

export default function EquipmentDetailPage({
  params,
}: {
  // `params` may be a Promise in Next.js 16; unwrap with React.use()
  params: any;
}) {
  // React.use() unwraps Promises passed to client components in Next.js 16
  const resolvedParams = (React as any).use
    ? (React as any).use(params)
    : params;
  const id = resolvedParams?.id;
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from("equipment")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEquipment(data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setError("Equipment not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, supabase]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (days <= 0) {
        setError("End date must be after start date");
        return;
      }

      const totalValue = days * equipment.price_per_day;

      const { error: rentalError } = await supabase.from("rentals").insert({
        equipment_id: equipment.id,
        renter_id: user.id,
        owner_id: equipment.owner_id,
        start_date: startDate,
        end_date: endDate,
        total_value: totalValue,
        status: "pending",
      });

      if (rentalError) throw rentalError;

      setSuccessMessage("Booking request created! Proceeding to payment...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <Spinner className="text-blue-500" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-300">Equipment not found</p>
            <Link href="/browse">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Back to Browse
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/browse" className="text-2xl font-bold text-white">
            Fest
          </Link>
          <Link href="/browse">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Back to Browse
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="bg-slate-700 rounded-lg aspect-square flex items-center justify-center">
            {equipment.image_url ? (
              <img
                src={equipment.image_url}
                alt={equipment.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-slate-500 text-center">
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-3xl">
                {equipment.name}
              </CardTitle>
              <CardDescription className="text-blue-400 text-lg">
                ${equipment.price_per_day.toFixed(2)}/day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-slate-300 mb-2">Category</p>
                <p className="text-slate-400">{equipment.category}</p>
              </div>

              <div>
                <p className="text-slate-300 mb-2">Description</p>
                <p className="text-slate-400">{equipment.description}</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                {error && (
                  <Alert className="bg-red-900/20 border-red-800">
                    <AlertDescription className="text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert className="bg-green-900/20 border-green-800">
                    <AlertDescription className="text-green-200">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-slate-200">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-slate-200">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {startDate && endDate && (
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-300">
                      {Math.ceil(
                        (new Date(endDate).getTime() -
                          new Date(startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days × ${equipment.price_per_day.toFixed(2)} =
                    </p>
                    <p className="text-2xl font-bold text-blue-400">
                      $
                      {(
                        Math.ceil(
                          (new Date(endDate).getTime() -
                            new Date(startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) * equipment.price_per_day
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isBooking || !equipment.available}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6"
                >
                  {isBooking ? "Processing..." : "Request Booking"}
                </Button>
              </form>

              {!equipment.available && (
                <p className="text-red-400 text-center">
                  This equipment is currently unavailable
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
