import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import ScanFlow from "./scan-flow";

export default async function ScanPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, name, logo_url, category, google_review_url, whatsapp_number")
    .eq("slug", params.slug)
    .maybeSingle<Business>();

  if (!business) notFound();

  return <ScanFlow business={business} />;
}
