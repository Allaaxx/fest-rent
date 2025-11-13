import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}
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

    const body = await request.json();
    const { rentalId, amount, vendorStripeId } = body;

    if (!rentalId || !amount || !vendorStripeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Platform fee: 15%
    const platformFee = Math.round(amount * 0.15);
    const vendorAmount = amount - platformFee;

    // Create checkout session with transfer data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Equipment Rental",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout/cancel`,
      customer_email: user.email,
      // Transfer data to vendor
      transfer_data: {
        destination: vendorStripeId,
        amount: vendorAmount,
      },
      metadata: {
        rentalId,
        userId: user.id,
      },
    } as any);

    // Update rental with Stripe session ID
    const { error: updateError } = await supabase
      .from("rentals")
      .update({ stripe_payment_id: session.id })
      .eq("id", rentalId);

    if (updateError) throw updateError;

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
