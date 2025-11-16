import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, price_per_day, image_url } =
      body || {};

    // Basic validation
    if (!name || !category || price_per_day == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, price_per_day" },
        { status: 400 }
      );
    }

    // Get server-side supabase client (reads cookies to find the user)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      return NextResponse.json(
        { error: "Missing Supabase server configuration" },
        { status: 500 }
      );
    }

    // Use admin client to bypass RLS for inserts where necessary
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const insertPayload = {
      owner_id: user.id,
      name,
      description: description ?? null,
      category,
      price_per_day: Number(price_per_day),
      image_url: image_url ?? null,
    } as any;

    const { data, error } = await admin
      .from("equipment")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error("Failed to insert equipment:", error);
      // If it's a foreign key / RLS issue, surface a helpful message in non-prod
      const message =
        process.env.NODE_ENV !== "production"
          ? error.message
          : "Failed to create equipment";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
