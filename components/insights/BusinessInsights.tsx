import { MIN_SCANS_FOR_TREND, summarize } from "@/lib/insights";
import type { Scan } from "@/lib/types";
import { ui } from "@/lib/ui";
import ExportCsvButton from "./ExportCsvButton";
import RatingBreakdown from "./RatingBreakdown";
import RatingTrendChart from "./RatingTrendChart";
import ScansTable from "./ScansTable";

function StatTile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "alert" }) {
  return (
    <div className={`${ui.card} p-5`}>
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${tone === "alert" ? "text-red-700" : ""}`}>
        {value}
      </p>
    </div>
  );
}

// Read-only analytics + scans list. Shared by the admin detail page and the owner dashboard.
export default function BusinessInsights({ scans, slug }: { scans: Scan[]; slug: string }) {
  const { total, average, low } = summarize(scans);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Customer feedback</h2>
          <p className="mt-1 text-sm text-stone-500">Every completed scan — the rating, the customer&apos;s own words, and their review draft.</p>
        </div>
        <ExportCsvButton
          scans={scans.map(({ rating, comment_raw, draft_text, created_at }) => ({
            rating,
            comment_raw,
            draft_text,
            created_at,
          }))}
          filename={`${slug}-scans-${today}.csv`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Total scans" value={total} />
        <StatTile label="Average rating" value={average === null ? "—" : `${average.toFixed(1)} ★`} />
        <StatTile label="Rated 1–3 ★" value={low} tone={low > 0 ? "alert" : undefined} />
      </div>

      {total > 0 && (
        <div className="grid grid-cols-[3fr_2fr] gap-4">
          <div className={`${ui.card} p-5`}>
            <h3 className="font-medium">Rating over time</h3>
            {total >= MIN_SCANS_FOR_TREND ? (
              <div className="mt-2">
                <RatingTrendChart scans={scans.map(({ rating, created_at }) => ({ rating, created_at }))} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-500">
                The trend chart appears once there are {MIN_SCANS_FOR_TREND} scans ({total} so far).
              </p>
            )}
          </div>
          <div className={`${ui.card} p-5`}>
            <h3 className="mb-4 font-medium">Ratings breakdown</h3>
            <RatingBreakdown scans={scans} />
          </div>
        </div>
      )}

      <ScansTable scans={scans} />
    </section>
  );
}
