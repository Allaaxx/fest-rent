import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: unknown }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // `params` may be a Promise in Next.js 16; await it and read `id`
    const resolvedParams = (await params) as { id?: string } | undefined;
    const id = resolvedParams?.id;

    // Verify user is the equipment owner
    const { data: rental, error: fetchError } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !rental || rental.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("rentals")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to approve rental" },
      { status: 500 }
    );
  }
}
