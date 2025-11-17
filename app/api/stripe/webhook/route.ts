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

  let event: Stripe.Event | undefined;
  const primarySecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;
  const fallbackSecret = process.env.STRIPE_WEBHOOK_SECRET_FALLBACK as
    | string
    | undefined;

  try {
    if (!primarySecret) throw new Error("Primary webhook secret not set");
    event = stripe.webhooks.constructEvent(body, signature, primarySecret);
  } catch (primaryErr) {
    // If a fallback secret is configured (for CLI/testing), try it before failing.
    if (fallbackSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, fallbackSecret);
        console.warn("Webhook signature verified using fallback secret");
      } catch (fallbackErr) {
        console.error(
          "Webhook signature verification failed (primary+fallback):",
          primaryErr,
          fallbackErr
        );
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    } else {
      console.error("Webhook signature verification failed:", primaryErr);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
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

  const writeErrors: string[] = [];

  if (event && event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let rentalId = session.metadata?.rentalId as string | undefined;

    console.log(
      "Webhook received checkout.session.completed, rentalId=",
      rentalId
    );

    console.log("session.id=", session.id);
    console.log("session.metadata=", session.metadata);

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

        if (found && (found as { id?: string }).id) {
          rentalId = (found as { id?: string }).id;
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
      try {
        const { data: updatedRental, error: updateError } = await supabase
          .from("rentals")
          .update({ status: "completed", stripe_payment_id: session.id })
          .eq("id", rentalId)
          .select();

        if (updateError) {
          console.error("Failed to update rental from webhook:", updateError);
          writeErrors.push("rental-update: " + JSON.stringify(updateError));
        } else {
          console.log("Updated rental from webhook:", updatedRental);
        }
      } catch (err) {
        console.error("Exception while updating rental from webhook:", err);
        writeErrors.push("rental-update-exception: " + String(err));
      }

      // Create payment record (idempotent by stripe_session_id)
      try {
        const totalCents = (session.amount_total ?? 0) as number;

        const { data: existing, error: existingErr } = await supabase
          .from("payments")
          .select("id")
          .eq("stripe_session_id", session.id)
          .limit(1)
          .maybeSingle();

        if (existingErr) {
          console.error("Error checking existing payment:", existingErr);
          writeErrors.push(
            "payment-existence-check: " + JSON.stringify(existingErr)
          );
        } else if (existing && (existing as { id?: string }).id) {
          console.log(
            "Payment already exists for stripe_session_id, skipping insert",
            session.id
          );
        } else {
          const { data: paymentRow, error: paymentError } = await supabase
            .from("payments")
            .insert({
              rental_id: rentalId,
              amount: totalCents / 100,
              status: "completed",
              stripe_session_id: session.id,
            })
            .select();

          if (paymentError) {
            console.error(
              "Failed to insert payment from webhook:",
              paymentError
            );
            writeErrors.push("payment-insert: " + JSON.stringify(paymentError));
          } else {
            console.log("Inserted payment from webhook:", paymentRow);
          }
        }
      } catch (err) {
        console.error("Exception while inserting payment from webhook:", err);
        writeErrors.push("payment-insert-exception: " + String(err));
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    let rentalId = session.metadata?.rentalId as string | undefined;

    // If metadata.rentalId missing, try to find by stripe_payment_id
    if (!rentalId) {
      try {
        const { data: found, error: findError } = await supabase
          .from("rentals")
          .select("id")
          .eq("stripe_payment_id", session.id)
          .limit(1)
          .maybeSingle();

        if (findError) {
          console.error("Error finding rental for expired session:", findError);
        }

        if (found && (found as { id?: string }).id) {
          rentalId = (found as { id?: string }).id;
          console.log("Found rental for expired session, rentalId=", rentalId);
        }
      } catch (err) {
        console.error(
          "Exception while finding rental for expired session:",
          err
        );
      }
    }

    if (rentalId) {
      // When a Checkout Session expires without payment, clear the
      // `stripe_payment_id` so the renter can attempt payment again.
      // Restore the rental `status` to "approved" so the Pay button
      // reappears (the checkout route only allows payments for approved rentals).
      try {
        const { error: updateErr } = await supabase
          .from("rentals")
          .update({ stripe_payment_id: null, status: "approved" })
          .eq("id", rentalId);

        if (updateErr) {
          console.error(
            "Failed to update rental for expired session:",
            updateErr
          );
          writeErrors.push(
            "rental-expire-update: " + JSON.stringify(updateErr)
          );
        } else {
          console.log(
            "Cleared stripe_payment_id and restored status=approved for rental",
            rentalId
          );
        }
      } catch (err) {
        console.error(
          "Exception while updating rental for expired session:",
          err
        );
        writeErrors.push("rental-expire-exception: " + String(err));
      }
    }
  }

  if (writeErrors.length > 0) {
    console.error("Webhook encountered write errors:", writeErrors);
    // Return 500 to ask Stripe to retry delivery
    return NextResponse.json(
      { error: "write-failed", details: writeErrors },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
