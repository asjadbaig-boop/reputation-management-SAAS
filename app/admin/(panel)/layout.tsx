import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import NavLink from "@/components/admin/NavLink";
import { BriefcaseIcon, LogOutIcon } from "@/components/icons";
import { ui } from "@/lib/ui";
import { logout } from "../auth-actions";

// Admin data must always be fresh — never serve cached service-role queries.
export const dynamic = "force-dynamic";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-3 py-5">
        <Link href="/admin" className="mb-8 px-2.5">
          <BrandMark />
        </Link>
        <p className="mb-1 px-2.5 text-xs font-medium uppercase tracking-wide text-stone-400">Manage</p>
        <nav className="flex flex-col gap-0.5">
          <NavLink href="/admin">
            <BriefcaseIcon width={18} height={18} /> Businesses
          </NavLink>
        </nav>
        <div className="mt-auto border-t border-stone-100 pt-3">
          <p className="mb-2 px-2.5 text-xs text-stone-400">Signed in as admin</p>
          <form action={logout}>
            <button type="submit" className={`${ui.buttonGhost} w-full px-2.5 py-2 text-sm`}>
              <LogOutIcon width={18} height={18} /> Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-10 py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
