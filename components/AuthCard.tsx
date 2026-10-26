import BrandMark from "@/components/BrandMark";
import { ui } from "@/lib/ui";

// Centered login card shared by the admin and business-owner login pages.
export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50 p-6">
      <div className="mb-8">
        <BrandMark />
      </div>
      <div className={`${ui.card} w-full max-w-sm p-8`}>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-stone-500">{description}</p>
        {children}
      </div>
    </main>
  );
}
