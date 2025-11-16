import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      return NextResponse.json(
        { error: "Server not configured: missing service role key" },
        { status: 500 }
      );
    }

    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get rentals owned by this user
    const { data: rentals, error: rentalsError } = await admin
      .from("rentals")
      .select("id")
      .eq("owner_id", user.id);

    if (rentalsError) {
      console.error("Failed to fetch rentals for earnings:", rentalsError);
      return NextResponse.json(
        { error: "Failed to fetch rentals" },
        { status: 500 }
      );
    }

    const rentalIds = (rentals || []).map((r: { id?: string }) => r.id as string).filter(Boolean);
    if (rentalIds.length === 0) {
      const debug = new URL(request.url).searchParams.get("debug");
      if (debug === "1" || process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          total: 0,
          payments: [],
          rentalCount: 0,
          rentalIds: [],
        });
      }
      return NextResponse.json({ total: 0, payments: [] });
    }

    const { data: payments, error: paymentsError } = await admin
      .from("payments")
      .select("*")
      .in("rental_id", rentalIds);

    if (paymentsError) {
      console.error("Failed to fetch payments for earnings:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    const total = (payments || []).reduce(
      (sum: number, p: { amount?: number | string }) => sum + Number(p.amount || 0),
      0
    );

    const debug = new URL(request.url).searchParams.get("debug");
    if (debug === "1" || process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        total,
        payments,
        rentalCount: rentalIds.length,
        rentalIds,
        paymentsCount: (payments || []).length,
      });
    }

    return NextResponse.json({ total, payments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
