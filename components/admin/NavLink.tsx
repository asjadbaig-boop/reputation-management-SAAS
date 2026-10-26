"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar link that highlights itself on its own section. /admin matches the business
// list and every business page, except the login page.
export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (pathname.startsWith(`${href}/`) && pathname !== "/admin/login");

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        active ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}
