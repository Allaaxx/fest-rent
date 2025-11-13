"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Payment {
  id: string;
  rental_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function VendorEarningsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Load vendor's stripe account id
        const { data: profile } = await supabase
          .from("users")
          .select("stripe_account_id")
          .eq("id", user.id)
          .single();
        setStripeAccountId(profile?.stripe_account_id ?? null);

        // Get all rentals where user is owner
        const { data: rentals, error: rentalsError } = await supabase
          .from("rentals")
          .select("id")
          .eq("owner_id", user.id);

        if (rentalsError) throw rentalsError;

        if (rentals && rentals.length > 0) {
          // Get payments for those rentals
          const rentalIds = rentals.map((r: { id: string }) => r.id);
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("payments")
            .select("*")
            .in("rental_id", rentalIds);

          if (paymentsError) throw paymentsError;

          setPayments(paymentsData || []);

          const total =
            (paymentsData as Payment[] | undefined)?.reduce(
              (sum: number, p: Payment) => sum + p.amount,
              0
            ) || 0;
          setTotalEarnings(total);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router, supabase]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect-account", {
        method: "POST",
      });
      const payload = await res.json();

      if (!res.ok) {
        const details = payload?.details ? `: ${payload.details}` : "";
        throw new Error(
          (payload?.error ?? "Failed to create Stripe account") + details
        );
      }

      // If server returned an onboarding URL, redirect vendor to Stripe onboarding
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      setStripeAccountId(payload.account_id ?? null);
    } catch (err) {
      console.error("Connect failed:", err);
      alert(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <Spinner className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
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
          <h1 className="text-3xl font-bold text-white">Earnings</h1>
        </div>

        <Card className="mb-8 bg-linear-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardContent className="pt-6">
            <p className="text-blue-200 text-sm mb-2">Total Earnings</p>
            <p className="text-4xl font-bold text-white">
              ${totalEarnings.toFixed(2)}
            </p>
            <div className="mt-4">
              {stripeAccountId ? (
                <div className="text-sm text-slate-300">
                  Connected:{" "}
                  <span className="font-mono ml-2">{stripeAccountId}</span>
                </div>
              ) : (
                <div>
                  <Button onClick={handleConnect} disabled={connecting}>
                    {connecting ? "Connecting..." : "Connect Stripe Account"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {payments.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-300">No payments yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">
                        Payment Received
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-300">
                        {payment.status}
                      </span>
                    </div>
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
