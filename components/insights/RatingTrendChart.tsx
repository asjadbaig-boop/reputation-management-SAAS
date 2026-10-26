"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import { ratingTrend, type ScanPoint } from "@/lib/insights";

const SERIES_COLOR = "#2a78d6";
const GRID_COLOR = "#e7e5e4";
const AXIS_TEXT = "#78716c";

function TrendTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload as { label: string; average: number; count: number };
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="text-sm font-semibold text-stone-900">{point.average.toFixed(2)} ★ average</p>
      <p className="text-stone-500">
        {point.label} · {point.count} scan{point.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default function RatingTrendChart({ scans }: { scans: ScanPoint[] }) {
  const { unit, points } = useMemo(() => ratingTrend(scans), [scans]);

  return (
    <div>
      <p className="mb-3 text-xs text-stone-500">Average rating per {unit}</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: AXIS_TEXT }}
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
              minTickGap={16}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: AXIS_TEXT }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }} />
            <Line
              type="linear"
              dataKey="average"
              stroke={SERIES_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: SERIES_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: SERIES_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
