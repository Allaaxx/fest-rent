import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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
    const { rentalId } = body;

    // vendorStripeId is optional; if not provided, lookup from rental -> owner -> users
    let vendorStripeId = body.vendorStripeId;

    if (!rentalId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // retrieve rental details
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("owner_id, renter_id, total_value, status")
      .eq("id", rentalId)
      .single();

    if (rentalError || !rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    const ownerId = rental.owner_id;
    const renterId = rental.renter_id;
    const status = rental.status;
    const totalValue = rental.total_value;

    // Only the renter can create a checkout for this rental
    if (renterId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: only renter can initiate payment" },
        { status: 403 }
      );
    }

    // Payment only allowed when rental is approved by vendor
    if (status !== "approved") {
      return NextResponse.json(
        { error: "Rental is not approved" },
        { status: 400 }
      );
    }

    if (!vendorStripeId) {
      // Try to fetch vendor stripe_account_id using a Service Role key to bypass RLS
      // (recommended). Falls back to the normal server client which may be blocked
      // by RLS when the requester is a different user.
      let ownerProfile: any = null;
      let ownerError: any = null;

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const admin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        const resp = await admin
          .from("users")
          .select("stripe_account_id")
          .eq("id", ownerId)
          .single();

        ownerProfile = resp.data;
        ownerError = resp.error;
      } else {
        const resp = await supabase
          .from("users")
          .select("stripe_account_id")
          .eq("id", ownerId)
          .single();

        ownerProfile = resp.data;
        ownerError = resp.error;
      }

      if (ownerError || !ownerProfile) {
        return NextResponse.json(
          { error: "Vendor profile not found (RLS or missing)" },
          { status: 404 }
        );
      }

      vendorStripeId = ownerProfile.stripe_account_id;

      if (!vendorStripeId) {
        return NextResponse.json(
          { error: "Vendor has not connected Stripe" },
          { status: 400 }
        );
      }
    }

    // Use server-side amount from rental to avoid client tampering
    const amount = Math.round(Number(totalValue) * 100);

    // Platform fee: 15%
    const platformFee = Math.round(amount * 0.15);

    // Create checkout session with transfer to connected account using
    // `payment_intent_data.transfer_data`. The top-level `transfer_data`
    // parameter is not accepted by the Checkout Sessions API (causes
    // 'parameter_unknown'). Use `application_fee_amount` to collect platform
    // fees and `transfer_data.destination` to route funds to the vendor.
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
      payment_intent_data: {
        transfer_data: {
          destination: vendorStripeId,
        },
        // application_fee_amount is charged to the customer and paid to the
        // platform. Amounts are in cents.
        application_fee_amount: platformFee,
      },
      metadata: {
        rentalId,
        userId: user.id,
      },
    } as Stripe.Checkout.SessionCreateParams);

    // Update rental with Stripe session ID
    const { error: updateError } = await supabase
      .from("rentals")
      .update({ stripe_payment_id: session.id })
      .eq("id", rentalId);

    if (updateError) throw updateError;

    // Return session id and hosted checkout URL so client can redirect
    const typedSession = session as Stripe.Checkout.Session;
    return NextResponse.json({
      sessionId: typedSession.id,
      url: typedSession.url,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
