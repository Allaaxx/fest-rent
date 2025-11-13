import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

  // Create a Supabase client. For webhooks (which are unauthenticated requests)
  // we should prefer using the Service Role key to bypass RLS so the webhook
  // can update rentals/payments. Fall back to the server client if the service
  // role key is not available.
  let supabase = await createClient();
  if (
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    let rentalId = session.metadata?.rentalId;

    console.log(
      "Webhook received checkout.session.completed, rentalId=",
      rentalId
    );

    // If metadata.rentalId is missing (e.g. when using Stripe fixtures),
    // try to find the rental by the stripe_payment_id we stored when
    // creating the Checkout Session.
    if (!rentalId) {
      try {
        const { data: found, error: findError } = await supabase
          .from("rentals")
          .select("id")
          .eq("stripe_payment_id", session.id)
          .limit(1)
          .maybeSingle();

        if (findError) {
          console.error(
            "Error searching rental by stripe_payment_id in webhook:",
            findError
          );
        }

        if (found && (found as any).id) {
          rentalId = (found as any).id;
          console.log(
            "Found rental by stripe_payment_id in webhook, rentalId=",
            rentalId
          );
        } else {
          console.warn(
            "checkout.session.completed received without rentalId metadata and no rental found by stripe_payment_id",
            session.id
          );
        }
      } catch (err) {
        console.error(
          "Exception while finding rental by stripe_payment_id:",
          err
        );
      }
    }

    if (rentalId) {
      // Update rental status to completed and record stripe session id
      const { error: updateError } = await supabase
        .from("rentals")
        .update({ status: "completed", stripe_payment_id: session.id })
        .eq("id", rentalId);

      if (updateError) {
        console.error("Failed to update rental from webhook:", updateError);
      }

      // Create payment record (guard against nullable amount_total)
      const totalCents = (session.amount_total ?? 0) as number;
      const { error: paymentError } = await supabase.from("payments").insert({
        rental_id: rentalId,
        amount: totalCents / 100,
        status: "completed",
        stripe_session_id: session.id,
      });

      if (paymentError) {
        console.error("Failed to insert payment from webhook:", paymentError);
      }
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
