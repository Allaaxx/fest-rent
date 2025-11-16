import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
        { error: "Server not configured: missing service role key" },
        { status: 500 }
      );
    }

    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify requester is admin using the admin client (safe against RLS)
    const { data: requesterProfile, error: requesterError } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (requesterError) {
      console.error("Failed to fetch requester profile:", requesterError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!requesterProfile || requesterProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await admin.from("users").select("*");

    if (error) {
      console.error("Failed to fetch users via admin endpoint:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
