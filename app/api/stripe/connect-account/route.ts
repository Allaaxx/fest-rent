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

    // Ensure only vendors can create/connect a Stripe account
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_account_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "vendor") {
      return NextResponse.json(
        { error: "Forbidden: only vendors may connect a Stripe account" },
        { status: 403 }
      );
    }

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create Stripe Connect account (default country set to BR for vendors)
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: user.email,
      });

      accountId = account.id;

      // Update user with Stripe account ID
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);

      if (updateError) throw updateError;
    }

    // Create an account link for onboarding (or refresh existing onboarding)
    const origin = request.nextUrl?.origin ?? "";
    const returnUrl = `${origin}/dashboard`;
    const refreshUrl = `${origin}/dashboard`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    } as any);

    return NextResponse.json({
      account_id: accountId,
      url: (accountLink as any).url,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    // Return error details to help debugging in development
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create Stripe account", details },
      { status: 500 }
    );
  }
}
