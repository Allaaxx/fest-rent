import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set.");
}

// Cast apiVersion to `any` to avoid strict type mismatches across Stripe SDK versions
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15" as any,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const rentalId = session.metadata?.rentalId;

    if (rentalId) {
      // Update rental status to approved
      await supabase
        .from("rentals")
        .update({ status: "approved" })
        .eq("id", rentalId);

      // Create payment record (guard against nullable amount_total)
      const totalCents = (session.amount_total ?? 0) as number;
      await supabase.from("payments").insert({
        rental_id: rentalId,
        amount: totalCents / 100,
        status: "completed",
        stripe_session_id: session.id,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const rentalId = session.metadata?.rentalId;

    if (rentalId) {
      // Update rental status to rejected
      await supabase
        .from("rentals")
        .update({ status: "rejected" })
        .eq("id", rentalId);
    }
  }

  return NextResponse.json({ received: true });
}
