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
    // Also create a signed URL as a fallback for private buckets
    const { data: signedData } = await supabase.storage.from("equipment-images").createSignedUrl(filePath, 60 * 60)

    return NextResponse.json(
      { publicUrl: publicData?.publicUrl ?? null, signedUrl: signedData?.signedUrl ?? null, path: filePath },
      { status: 201 },
    )
  } catch (error) {
    // Map common client-side errors to friendly messages for the user.
    // Do not leak internal error details in production.
    const raw = error instanceof Error ? error.message : String(error)

    // Detect the Content-Type / multipart error coming from storage/client
    const isContentTypeError = /Content-Type was not one of|multipart\/form-data|application\/x-www-form-urlencoded/i.test(raw)

    if (isContentTypeError) {
      // Client likely sent a request with wrong content-type (debugged earlier).
      return NextResponse.json(
        { error: "Erro de upload: dados enviados inválidos. Por favor, envie a imagem corretamente e tente novamente." },
        { status: 400 },
      )
    }

    const message = process.env.NODE_ENV !== "production" ? raw : "Failed to create equipment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
