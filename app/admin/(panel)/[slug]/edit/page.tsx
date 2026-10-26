import { notFound } from "next/navigation";
import BusinessForm from "@/components/admin/BusinessForm";
import PageHeader from "@/components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_COLUMNS, type Business } from "@/lib/types";
import { updateBusiness } from "../../actions";

export default async function EditBusinessPage({ params }: { params: { slug: string } }) {
  const { data: business } = await createAdminClient()
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("slug", params.slug)
    .maybeSingle<Business>();

  if (!business) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${business.name}`} back={{ href: `/admin/${business.slug}`, label: business.name }} />
      <BusinessForm
        action={updateBusiness.bind(null, business.id)}
        business={business}
        submitLabel="Save changes"
        cancelHref={`/admin/${business.slug}`}
      />
    </div>
  );
}
