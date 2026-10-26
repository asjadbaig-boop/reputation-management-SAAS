import { ratingBreakdown, type ScanPoint } from "@/lib/insights";

export default function RatingBreakdown({ scans }: { scans: ScanPoint[] }) {
  const rows = ratingBreakdown(scans);
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(({ stars, count }) => {
        const share = scans.length ? Math.round((count / scans.length) * 100) : 0;
        return (
          <li
            key={stars}
            className="grid grid-cols-[2.5rem_1fr_4.5rem] items-center gap-3 text-sm"
            title={`${stars} star: ${count} scan${count === 1 ? "" : "s"} (${share}%)`}
          >
            <span className="text-stone-600">{stars} ★</span>
            <div className="h-2.5 rounded-full bg-stone-100">
              {count > 0 && (
                <div
                  className="h-full rounded-full bg-[#2a78d6]"
                  style={{ width: `${(count / max) * 100}%`, minWidth: "0.5rem" }}
                />
              )}
            </div>
            <span className="text-right tabular-nums text-stone-900">
              {count} <span className="text-stone-400">· {share}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
