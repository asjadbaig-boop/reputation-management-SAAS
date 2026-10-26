import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import OwnerInvite from "@/components/admin/OwnerInvite";
import { DownloadIcon, EditIcon, ExternalLinkIcon } from "@/components/icons";
import BusinessInsights from "@/components/insights/BusinessInsights";
import PageHeader from "@/components/PageHeader";
import { publicBusinessUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_COLUMNS, type Business, type Scan } from "@/lib/types";
import { ui } from "@/lib/ui";
import { inviteOwner } from "../actions";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 py-2.5 text-sm">
      <dt className="text-stone-500">{label}</dt>
      <dd className="min-w-0 break-words">{value || <span className="text-stone-400">Not set</span>}</dd>
    </div>
  );
}

function ExternalLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={ui.link}>
      {href}
    </a>
  );
}

export default async function BusinessDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select(`${BUSINESS_COLUMNS}, owner_user_id`)
    .eq("slug", params.slug)
    .maybeSingle<Business & { owner_user_id: string | null }>();

  if (!business) notFound();

  const { data: scans, error: scansError } = await supabase
    .from("scans")
    .select("id, business_id, rating, comment_raw, draft_text, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .returns<Scan[]>();

  const ownerEmail = business.owner_user_id
    ? ((await supabase.auth.admin.getUserById(business.owner_user_id)).data.user?.email ?? null)
    : null;

  const publicUrl = publicBusinessUrl(business.slug);
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 1024, margin: 2 });

  return (
    <div>
      <PageHeader
        back={{ href: "/admin", label: "Businesses" }}
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
          <>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={`${ui.buttonSecondary} h-10 px-4 text-sm`}>
              <ExternalLinkIcon width={16} height={16} /> View page
            </a>
            <Link href={`/admin/${business.slug}/edit`} className={`${ui.buttonPrimary} h-10 px-4 text-sm`}>
              <EditIcon width={16} height={16} /> Edit details
            </Link>
          </>
        }
      />

      <div className="mb-12 grid grid-cols-[1fr_17rem] gap-6">
        <div className="flex flex-col gap-6">
          <section className={`${ui.card} p-6`}>
            <h2 className="mb-1 font-semibold">Details</h2>
            <dl className="divide-y divide-stone-100">
              <InfoRow label="Public URL" value={<ExternalLink href={publicUrl} />} />
              <InfoRow label="Slug" value={<span className="font-mono text-xs">{business.slug}</span>} />
              <InfoRow label="Google review URL" value={<ExternalLink href={business.google_review_url} />} />
              <InfoRow label="WhatsApp" value={business.whatsapp_number} />
              <InfoRow label="Logo URL" value={<ExternalLink href={business.logo_url} />} />
              <InfoRow label="Instagram" value={<ExternalLink href={business.instagram_url} />} />
              <InfoRow label="Facebook" value={<ExternalLink href={business.facebook_url} />} />
            </dl>
          </section>

          <section className={`${ui.card} p-6`}>
            <h2 className="font-semibold">Owner dashboard access</h2>
            <p className="mb-4 mt-1 text-sm text-stone-500">
              The owner logs in at /dashboard to see this business&apos;s feedback (read-only).
            </p>
            <OwnerInvite action={inviteOwner.bind(null, business.id, business.slug)} ownerEmail={ownerEmail} />
          </section>
        </div>

        <section className={`${ui.card} flex h-fit flex-col items-center p-6`}>
          <h2 className="mb-4 self-start font-semibold">QR code</h2>
          <div className="rounded-xl p-2 ring-1 ring-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR code for ${publicUrl}`} className="h-48 w-48" />
          </div>
          <a
            href={qrDataUrl}
            download={`${business.slug}-qr.png`}
            className={`${ui.buttonPrimary} mt-5 h-10 w-full text-sm`}
          >
            <DownloadIcon width={16} height={16} /> Download QR
          </a>
          <p className="mt-3 break-all text-center text-xs text-stone-500">
            Encodes <span className="font-mono">{publicUrl}</span>
          </p>
        </section>
      </div>

      {scansError ? (
        <p className="text-red-600">Couldn&apos;t load scans: {scansError.message}</p>
      ) : (
        <BusinessInsights scans={scans ?? []} slug={business.slug} />
      )}
    </div>
  );
}
