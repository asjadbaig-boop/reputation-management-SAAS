import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { ui } from "@/lib/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-stone-100 to-stone-50 p-8 text-center">
      <BrandMark />
      <p className="text-stone-600">Admin at /admin, client login at /dashboard</p>
      <div className="flex gap-2">
        <Link href="/admin" className={`${ui.buttonPrimary} h-10 px-4 text-sm`}>
          Admin
        </Link>
        <Link href="/dashboard" className={`${ui.buttonSecondary} h-10 px-4 text-sm`}>
          Business owner login
        </Link>
      </div>
    </main>
  );
}
