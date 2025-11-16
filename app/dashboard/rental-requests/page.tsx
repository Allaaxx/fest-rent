"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

interface Rental {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_value: number;
  status: string;
}

export default function RentalRequestsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("rentals")
          .select("*")
          .eq("owner_id", user.id)
          .eq("status", "pending");

        if (error) throw error;
        setRentals(data || []);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load rental requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [router, supabase]);

  const handleApprove = async (rentalId: string) => {
    setActionLoading(rentalId);
    try {
      const response = await fetch(`/api/rentals/${rentalId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve rental");
      }

      setRentals(
        rentals.map((r) =>
          r.id === rentalId ? { ...r, status: "approved" } : r
        )
      );
      toast({
        title: "Pedido aprovado",
        description: "O pedido foi aprovado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (rentalId: string) => {
    setActionLoading(rentalId);
    try {
      const response = await fetch(`/api/rentals/${rentalId}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reject rental");
      }

      setRentals(
        rentals.map((r) =>
          r.id === rentalId ? { ...r, status: "rejected" } : r
        )
      );
      toast({
        title: "Pedido recusado",
        description: "O pedido foi recusado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <Spinner className="text-blue-500" />
      </div>
    );
  }

  const pendingRentals = rentals.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
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

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Rental Requests</h1>
          <p className="text-slate-400 mt-2">
            {pendingRentals.length} pending request
            {pendingRentals.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Notifications appear as toasts (Toaster mounted in layout) */}

        {pendingRentals.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-300">No pending rental requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRentals.map((rental) => (
              <Card key={rental.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-slate-300 mb-2">
                        <span className="font-semibold">Period:</span>{" "}
                        {rental.start_date} to {rental.end_date}
                      </p>
                      <p className="text-2xl font-bold text-blue-400">
                        ${rental.total_value.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-900/30 text-yellow-300">
                      Pending
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleApprove(rental.id)}
                      disabled={actionLoading === rental.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === rental.id
                        ? "Processing..."
                        : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleReject(rental.id)}
                      disabled={actionLoading === rental.id}
                      variant="outline"
                      className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      {actionLoading === rental.id ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
