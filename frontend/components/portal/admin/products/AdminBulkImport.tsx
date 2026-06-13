"use client";

import { useState } from "react";
import { parseProductCsv } from "@/lib/products/csv-import";
import type { CsvImportRow } from "@/lib/products/types";
import { toast } from "@/lib/toast";

export function AdminBulkImport() {
  const [rows, setRows] = useState<CsvImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      toast.error("Upload a CSV file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRows(parseProductCsv(text));
    };
    reader.readAsText(file);
  }

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center ${
          isDragging ? "border-pacific-teal bg-pacific-teal/5" : "border-deep-teal/15"
        }`}
      >
        <p className="text-sm font-light text-deep-teal">Drag and drop CSV here</p>
        <p className="mt-1 text-xs text-deep-teal/50">Columns: SKU, Name, Category, Type, Price, Stock</p>
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

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-deep-teal/10">
            <table className="min-w-full text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((row) => (
                  <tr key={row.row} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3">{row.row}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3">${row.price}</td>
                    <td className="px-4 py-3">{row.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errorRows.length > 0 ? (
            <div className="rounded-xl border border-coral-blush bg-coral-blush/40 p-4">
              <p className="text-sm font-light text-deep-teal">Failed rows</p>
              <ul className="mt-2 space-y-1 text-xs text-deep-teal/80">
                {errorRows.map((row) => (
                  <li key={row.row}>Row {row.row}: {row.error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => toast.success(`Imported ${validRows.length} products.`)}
            disabled={validRows.length === 0}
            className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
          >
            Confirm import ({validRows.length} rows)
          </button>
        </>
      ) : null}
    </div>
  );
}
