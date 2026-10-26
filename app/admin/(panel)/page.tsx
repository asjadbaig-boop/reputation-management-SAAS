import Link from "next/link";
import LocalTime from "@/components/LocalTime";
import PageHeader from "@/components/PageHeader";
import { PlusIcon } from "@/components/icons";
import { createAdminClient } from "@/lib/supabase/admin";
import { ui } from "@/lib/ui";

export default async function AdminBusinessesPage() {
  const { data: businesses, error } = await createAdminClient()
    .from("businesses")
    .select("id, slug, name, category, logo_url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Businesses"
        description={businesses ? `${businesses.length} business${businesses.length === 1 ? "" : "es"}` : undefined}
        actions={
          <Link href="/admin/new" className={`${ui.buttonPrimary} h-10 px-4 text-sm`}>
            <PlusIcon width={16} height={16} /> New business
          </Link>
        }
      />

      {error ? (
        <p className="text-red-600">Couldn&apos;t load businesses: {error.message}</p>
      ) : !businesses?.length ? (
        <div className={`${ui.card} flex flex-col items-center gap-3 px-8 py-16 text-center`}>
          <p className="font-medium">No businesses yet</p>
          <p className="text-sm text-stone-500">Create one to get its QR code and start collecting feedback.</p>
          <Link href="/admin/new" className={`${ui.buttonPrimary} mt-2 h-10 px-4 text-sm`}>
            <PlusIcon width={16} height={16} /> New business
          </Link>
        </div>
      ) : (
        <div className={`${ui.card} overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/60 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {businesses.map((business) => (
                <tr key={business.id} className="group relative transition-colors hover:bg-stone-50">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/${business.slug}`}
                      className="flex items-center gap-3 font-medium after:absolute after:inset-0"
                    >
                      {business.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={business.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-stone-200" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-xs font-semibold text-stone-600">
                          {business.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      {business.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-stone-500">{business.slug}</td>
                  <td className="px-5 py-3.5 text-stone-600">{business.category ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone-500">
                    {business.created_at ? <LocalTime value={business.created_at} /> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
