import LocalTime from "@/components/LocalTime";
import type { Scan } from "@/lib/types";
import { ui } from "@/lib/ui";

export default function ScansTable({ scans }: { scans: Scan[] }) {
  if (!scans.length) {
    return (
      <div className={`${ui.card} px-8 py-14 text-center`}>
        <p className="font-medium">No scans yet</p>
        <p className="mt-1 text-sm text-stone-500">They&apos;ll appear here once customers use the QR code.</p>
      </div>
    );
  }

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50/60 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="w-24 px-5 py-3 font-medium">Rating</th>
            <th className="px-5 py-3 font-medium">Customer comment</th>
            <th className="px-5 py-3 font-medium">Review draft</th>
            <th className="w-52 px-5 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {scans.map((scan) => {
            const low = scan.rating <= 3;
            return (
              <tr key={scan.id} className={low ? "bg-red-50/60" : undefined}>
                <td className={`px-5 py-3.5 align-top ${low ? "border-l-2 border-red-400" : "border-l-2 border-transparent"}`}>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                      low ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {scan.rating} ★
                  </span>
                </td>
                <td className="whitespace-pre-wrap px-5 py-3.5 align-top text-stone-900">
                  {scan.comment_raw || <span className="text-stone-400">No comment</span>}
                </td>
                <td className="whitespace-pre-wrap px-5 py-3.5 align-top text-stone-500">
                  {scan.draft_text || <span className="text-stone-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 align-top text-stone-500">
                  <LocalTime value={scan.created_at} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
