"use client";

import { useMemo, useState } from "react";
import { parseTrackingCsv } from "@/lib/orders/tracking-csv";
import type { TrackingCsvRow } from "@/lib/orders/types";
import { toast } from "@/lib/toast";

type BulkTrackingImportModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (rows: TrackingCsvRow[]) => { updated: number; failed: number };
  validOrderIds?: Set<string>;
};

export function BulkTrackingImportModal({
  open,
  onClose,
  onConfirm,
  validOrderIds,
}: BulkTrackingImportModalProps) {
  const [rows, setRows] = useState<TrackingCsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(null);

  if (!open) return null;

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      toast.error("Upload a CSV file.");
      return;
    }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      setRows(parseTrackingCsv(String(reader.result ?? ""), validOrderIds));
    };
    reader.readAsText(file);
  }

  const validRows = useMemo(() => rows.filter((row) => !row.error), [rows]);
  const errorRows = useMemo(() => rows.filter((row) => row.error), [rows]);

  function handleConfirm() {
    const summary = onConfirm(validRows);
    setResult(summary);
    toast.success(`Updated ${summary.updated} orders. ${summary.failed} failed.`);
  }

  function handleClose() {
    setRows([]);
    setFileName("");
    setResult(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-import-title"
        className="relative z-10 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 id="tracking-import-title" className="font-sans text-xl font-light text-deep-teal">
          Import tracking CSV
        </h2>
        <p className="mt-1 text-sm text-deep-teal/55">
          Columns: Order ID, Carrier, Tracking Number, Shipped Date
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`mt-4 rounded-2xl border-2 border-dashed px-6 py-8 text-center ${
            isDragging ? "border-pacific-teal bg-pacific-teal/5" : "border-deep-teal/15"
          }`}
        >
          <p className="text-sm font-light text-deep-teal">Drag and drop CSV here</p>
          <input
            type="file"
            accept=".csv"
            className="mt-3 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {fileName ? <p className="mt-2 text-xs text-deep-teal/45">{fileName}</p> : null}
        </div>

        {rows.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto rounded-xl border border-deep-teal/10">
              <table className="min-w-full text-sm">
                <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Order ID</th>
                    <th className="px-3 py-2">Carrier</th>
                    <th className="px-3 py-2">Tracking #</th>
                    <th className="px-3 py-2">Shipped</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.map((row) => (
                    <tr key={row.row} className="border-b border-deep-teal/5">
                      <td className="px-3 py-2">{row.row}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.orderId}</td>
                      <td className="px-3 py-2">{row.carrier}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.trackingNumber}</td>
                      <td className="px-3 py-2">{row.shippedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errorRows.length > 0 ? (
              <ul className="mt-3 space-y-1 rounded-xl border border-coral-blush bg-coral-blush/40 p-3 text-xs text-deep-teal/80">
                {errorRows.map((row) => (
                  <li key={row.row}>Row {row.row}: {row.error}</li>
                ))}
              </ul>
            ) : null}

            {result ? (
              <div className="mt-4 rounded-xl border border-pacific-teal/20 bg-pacific-teal/5 p-4 text-sm text-deep-teal">
                <p className="font-light">Import complete</p>
                <p className="mt-1 text-deep-teal/70">
                  {result.updated} rows updated · {result.failed} rows failed
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={validRows.length === 0}
                onClick={handleConfirm}
                className="mt-4 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-40"
              >
                Confirm import
              </button>
            )}
          </>
        ) : null}

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 text-sm text-deep-teal/55 hover:text-deep-teal"
        >
          Close
        </button>
      </div>
    </div>
  );
}
