"use client";

import React, { useState, useEffect } from "react";
import { Download, FileJson, FileSpreadsheet, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

interface ExportItem {
  id: string;
  format: string;
  status: string;
  downloadUrl?: string | null;
  createdAt: string;
}

export function ExportClient() {
  const [exports, setExports] = useState<ExportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState("");

  const loadExports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/export");
      const data = await res.json();
      if (data.ok) {
        setExports(data.exports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExports();
  }, []);

  const handleRequestExport = async (format: "json" | "csv") => {
    setRequesting(true);
    setMsg("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`Full health data export (${format.toUpperCase()}) prepared successfully!`);
        loadExports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          📦 Export Your Health Data (DPDP Act)
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Full portability guaranteed. Download all your logged telemetry, medications, conditions, and audit logs at any time.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-primary-soft border border-primary/30 rounded-2xl text-xs text-primary-dark font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {msg}
        </div>
      )}

      {/* Export Options Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Generate New Export Package
        </h2>
        <p className="text-xs text-ink-soft">
          Select your preferred data format. Exports are bundled client-side with complete encryption.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => handleRequestExport("json")}
            disabled={requesting}
            className="p-4 rounded-2xl border border-line hover:border-primary hover:bg-primary-soft/50 text-left transition flex items-start gap-3 disabled:opacity-50"
          >
            <div className="p-2.5 bg-primary-soft text-primary-dark rounded-lg">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-ink">Export as JSON</div>
              <div className="text-xs text-ink-soft mt-0.5">
                Complete structured object format with nested logs, medications, and profile metadata.
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRequestExport("csv")}
            disabled={requesting}
            className="p-4 rounded-2xl border border-line hover:border-accent hover:bg-accent-soft/50 text-left transition flex items-start gap-3 disabled:opacity-50"
          >
            <div className="p-2.5 bg-accent-soft text-accent rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-ink">Export as CSV / Excel</div>
              <div className="text-xs text-ink-soft mt-0.5">
                Tabular format ideal for importing into Google Sheets, Excel, or statistical software.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Past Generated Archives
        </h2>

        {loading ? (
          <div className="py-6 text-center text-ink-muted text-xs">Loading past exports...</div>
        ) : exports.length === 0 ? (
          <div className="py-8 text-center text-ink-muted text-xs border border-dashed border-line rounded-2xl">
            No past exports found. Request an export above to download your archive.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {exports.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-ink">
                    {item.format.toUpperCase()} Archive ({item.status})
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Requested on {new Date(item.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download={`lifeify-health-export-${item.id.slice(-6)}.${item.format}`}
                    className="lif-btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
