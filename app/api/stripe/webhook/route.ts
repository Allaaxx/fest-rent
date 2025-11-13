import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const rentalId = session.metadata?.rentalId

    if (rentalId) {
      // Update rental status to approved
      await supabase.from("rentals").update({ status: "approved" }).eq("id", rentalId)

      // Create payment record
      await supabase.from("payments").insert({
        rental_id: rentalId,
        amount: session.amount_total / 100,
        status: "completed",
        stripe_session_id: session.id,
      })
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object
    const rentalId = session.metadata?.rentalId

    if (rentalId) {
      // Update rental status to rejected
      await supabase.from("rentals").update({ status: "rejected" }).eq("id", rentalId)
    }
  }

  return NextResponse.json({ received: true })
}
