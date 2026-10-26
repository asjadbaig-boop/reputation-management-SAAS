import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { ExternalLinkIcon, LogOutIcon } from "@/components/icons";
import BusinessInsights from "@/components/insights/BusinessInsights";
import PageHeader from "@/components/PageHeader";
import { publicBusinessUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { BUSINESS_COLUMNS, type Business, type Scan } from "@/lib/types";
import { ui } from "@/lib/ui";
import { signOut } from "./auth-actions";

export const dynamic = "force-dynamic";

// Business owner's read-only view. Uses the owner's own session (anon key + RLS),
// never the service-role client, so they can only see their own business's rows.
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/login");

  const { data: business } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Business>();

  const { data: scans, error: scansError } = business
    ? await supabase
        .from("scans")
        .select("id, business_id, rating, comment_raw, draft_text, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .returns<Scan[]>()
    : { data: null, error: null };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-10">
          <BrandMark />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-stone-500">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className={`${ui.buttonGhost} px-2.5 py-1.5 text-sm`}>
                <LogOutIcon width={16} height={16} /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-10 py-10">
        {!business ? (
          <div className={`${ui.card} px-8 py-16 text-center`}>
            <p className="font-medium">No business is linked to this account yet.</p>
            <p className="mt-1 text-sm text-stone-500">Ask your Review Engine contact to link your business.</p>
          </div>
        ) : (
          <>
            <PageHeader
              title={
                <span className="flex items-center gap-3">
                  {business.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-stone-200" />
                  )}
                  {business.name}
                </span>
              }
              description={business.category}
              actions={
                <a
                  href={publicBusinessUrl(business.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ui.buttonSecondary} h-10 px-4 text-sm`}
                >
                  <ExternalLinkIcon width={16} height={16} /> View review page
                </a>
              }
            />
            {scansError ? (
              <p className="text-red-600">Couldn&apos;t load feedback: {scansError.message}</p>
            ) : (
              <BusinessInsights scans={scans ?? []} slug={business.slug} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
