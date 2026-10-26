import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BUSINESS_COLUMNS, type Business } from "@/lib/types";
import ScanFlow from "./scan-flow";

export default async function ScanPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("slug", params.slug)
    .maybeSingle<Business>();

  if (!business) notFound();

  return <ScanFlow business={business} />;
}
