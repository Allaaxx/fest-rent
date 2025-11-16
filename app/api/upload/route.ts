import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`
    const filePath = `equipment/${filename}`

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing Supabase configuration on server" }, { status: 500 })
    }

    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from("equipment-images")
      .upload(filePath, buffer, { contentType: file.type, cacheControl: "3600", upsert: false })

    if (error) {
      console.error("Supabase server upload error:", error)
      throw error
    }

    const { data: publicData } = supabase.storage.from("equipment-images").getPublicUrl(filePath)

    return NextResponse.json({ publicUrl: publicData?.publicUrl ?? null, path: filePath }, { status: 201 })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
