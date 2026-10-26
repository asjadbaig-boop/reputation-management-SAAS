"use client";

import { DownloadIcon } from "@/components/icons";
import { scansToCsv, type ExportableScan } from "@/lib/insights";
import { ui } from "@/lib/ui";

export default function ExportCsvButton({ scans, filename }: { scans: ExportableScan[]; filename: string }) {
  function download() {
    const blob = new Blob([scansToCsv(scans)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={!scans.length}
      className={`${ui.buttonSecondary} h-10 px-4 text-sm`}
    >
      <DownloadIcon width={16} height={16} /> Export CSV
    </button>
  );
}
