"use client";

import { useMemo, useState } from "react";
import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";
import { useAdminOrders } from "@/context/OrdersProvider";
import { parseTrackingCsv, TRACKING_CSV_SAMPLE } from "@/lib/orders/mock-data";
import type { TrackingCsvRow } from "@/lib/orders/types";
import { toast } from "@/lib/toast";

export function WmsBulkTrackingImport() {
  const { applyTrackingImport } = useAdminOrders();
  const [rows, setRows] = useState<TrackingCsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      toast.error("Upload a CSV file.");
      return;
    }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      setRows(parseTrackingCsv(String(reader.result ?? "")));
    };
    reader.readAsText(file);
  }

  const validRows = useMemo(() => rows.filter((row) => !row.error), [rows]);
  const errorRows = useMemo(() => rows.filter((row) => row.error), [rows]);

  function handleImport() {
    const summary = applyTrackingImport(validRows);
    setResult(summary);
    toast.success(`Updated ${summary.updated} orders. ${summary.failed} failed.`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Bulk Tracking Import</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Upload carrier tracking updates via CSV</p>
      </div>

      <WmsSubNav />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`rounded-2xl border-2 border-dashed bg-pure-white px-6 py-12 text-center shadow-sm ${
          isDragging ? "border-pacific-teal bg-pacific-teal/5" : "border-deep-teal/15"
        }`}
      >
        <p className="text-sm font-medium text-deep-teal">Drag and drop CSV here</p>
        <p className="mt-1 text-xs text-deep-teal/45">Columns: Order ID, Carrier, Tracking Number, Shipped Date</p>
        <input
          type="file"
          accept=".csv"
          className="mt-4 text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {fileName ? <p className="mt-2 text-xs text-deep-teal/45">{fileName}</p> : null}
      </div>

      <details className="rounded-xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4 text-sm">
        <summary className="cursor-pointer font-medium text-deep-teal">Sample CSV format</summary>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-pure-white p-3 font-mono text-xs text-deep-teal/70">{TRACKING_CSV_SAMPLE}</pre>
      </details>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3 text-left">Row</th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Carrier</th>
                  <th className="px-4 py-3 text-left">Tracking #</th>
                  <th className="px-4 py-3 text-left">Shipped</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.row} className={`border-b border-deep-teal/5 ${row.error ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3">{row.row}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.orderId}</td>
                    <td className="px-4 py-3">{row.carrier}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.trackingNumber}</td>
                    <td className="px-4 py-3">{row.shippedDate}</td>
                    <td className="px-4 py-3 text-xs">{row.error ? <span className="text-red-600">{row.error}</span> : "Ready"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errorRows.length > 0 ? (
            <p className="text-sm text-red-600">{errorRows.length} row(s) with errors will be skipped.</p>
          ) : null}

          {result ? (
            <div className="rounded-2xl border border-pacific-teal/20 bg-pacific-teal/5 p-5">
              <p className="font-medium text-deep-teal">Import complete</p>
              <p className="mt-1 text-sm text-deep-teal/70">
                {result.updated} orders updated · {result.failed} rows failed
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={validRows.length === 0}
              onClick={handleImport}
              className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-40"
            >
              Import {validRows.length} row{validRows.length === 1 ? "" : "s"}
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
