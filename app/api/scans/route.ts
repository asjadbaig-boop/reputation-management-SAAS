import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendLowRatingAlert } from "@/lib/alerts";

const MAX_TEXT_LENGTH = 5000;

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, MAX_TEXT_LENGTH) : null;
}

// Records a public scan, then (for 1-3 stars) sends a low-rating alert.
// Uses the anon key, so the same public-insert RLS policy applies as before — and no
// .select() after the insert, since anon can't read scans back.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessId, rating } = body;
  if (typeof businessId !== "string" || !businessId) {
    return NextResponse.json({ error: "businessId is required" }, { status: 400 });
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be an integer 1-5" }, { status: 400 });
  }

  const comment = text(body.comment);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("scans").insert({
    business_id: businessId,
    rating,
    comment_raw: comment,
    draft_text: text(body.draft),
  });
  if (error) {
    console.error("Failed to record scan:", error.message);
    return NextResponse.json({ error: "Couldn't record scan" }, { status: 500 });
  }

  if (rating <= 3) {
    const { data: business } = await supabase.from("businesses").select("name, slug").eq("id", businessId).maybeSingle();
    if (business) {
      await sendLowRatingAlert({ businessName: business.name, slug: business.slug, rating, comment });
    }
  }

  return new NextResponse(null, { status: 201 });
}
