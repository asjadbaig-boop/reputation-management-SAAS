import { StarIcon } from "@/components/icons";

export default function BrandMark({ label = "Review Engine" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-amber-300">
        <StarIcon width={16} height={16} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="font-semibold tracking-tight text-stone-900">{label}</span>
    </span>
  );
}
