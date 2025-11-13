import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}
// Cast apiVersion to any to avoid type mismatches between SDK versions
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15" as any,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
    });

    // Update user with Stripe account ID
    const { error: updateError } = await supabase
      .from("users")
      .update({ stripe_account_id: account.id })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ account_id: account.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe account" },
      { status: 500 }
    );
  }
}
