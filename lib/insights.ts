import type { Scan } from "@/lib/types";

export type ScanPoint = Pick<Scan, "rating" | "created_at">;
export type ExportableScan = Pick<Scan, "rating" | "comment_raw" | "draft_text" | "created_at">;

// Below this many scans a trend chart is mostly noise, so we show summary stats only.
export const MIN_SCANS_FOR_TREND = 5;

export function summarize(scans: ScanPoint[]) {
  const total = scans.length;
  const average = total ? scans.reduce((sum, scan) => sum + scan.rating, 0) / total : null;
  const low = scans.filter((scan) => scan.rating <= 3).length;
  return { total, average, low };
}

export function ratingBreakdown(scans: ScanPoint[]) {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: scans.filter((scan) => scan.rating === stars).length,
  }));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7; // weeks start on Monday
  day.setDate(day.getDate() - offset);
  return day;
}

// Average rating per day, or per week once the scans span more than a month.
// Runs in the browser so days follow the viewer's timezone.
export function ratingTrend(scans: ScanPoint[]) {
  if (!scans.length) return { unit: "day" as const, points: [] };

  const times = scans.map((scan) => new Date(scan.created_at).getTime());
  const spanDays = (Math.max(...times) - Math.min(...times)) / 86_400_000;
  const unit = spanDays > 31 ? ("week" as const) : ("day" as const);
  const bucketOf = unit === "week" ? startOfWeek : startOfDay;

  const buckets = new Map<number, { sum: number; count: number }>();
  for (const scan of scans) {
    const key = bucketOf(new Date(scan.created_at)).getTime();
    const bucket = buckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += scan.rating;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  const points = Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, { sum, count }]) => ({
      time,
      label: new Date(time).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      average: Math.round((sum / count) * 100) / 100,
      count,
    }));

  return { unit, points };
}

function csvCell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  // Stop spreadsheet apps from evaluating customer-written text as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function scansToCsv(scans: ExportableScan[]) {
  const header = ["rating", "comment_raw", "draft_text", "created_at"];
  const rows = scans.map((scan) =>
    [scan.rating, scan.comment_raw, scan.draft_text, scan.created_at].map(csvCell).join(",")
  );
  // BOM so Excel opens UTF-8 (emoji, accented names) correctly.
  return "﻿" + [header.join(","), ...rows].join("\r\n");
}
