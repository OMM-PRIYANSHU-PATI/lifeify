"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Copy, Check, Stethoscope, Activity, Pill, AlertCircle } from "lucide-react";

export function DoctorSummaryClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/doctor-summary")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setData(res.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyText = () => {
    if (!data) return;
    const text = `LIFEIFY Clinical Summary for ${data.patient.name}:
- Age/Sex: ${data.patient.age} / ${data.patient.sex}
- Blood Group: ${data.patient.bloodGroup}
- Adherence (7-day): ${data.adherence.week}%
- Active Medications: ${data.medications.map((m: any) => `${m.name} (${m.dose || ""})`).join(", ") || "None"}
- Conditions: ${data.conditions.map((c: any) => c.type).join(", ") || "None"}
- Recent Vitals: ${data.vitals.slice(0, 3).map((v: any) => `${v.type}: ${v.type === "BP" ? `${v.systolic}/${v.diastolic}` : v.value}`).join("; ") || "None"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading clinical summary...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-indigo-500" />
            Doctor Visit Summary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized clinical summary ready for your physician consultation or second opinion.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Text"}
          </button>
          <a
            href="/api/doctor-summary/pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </a>
        </div>
      </div>

      {/* Summary Content Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        {/* Patient Profile */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">1. Demographics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div>
              <span className="text-slate-400 block">Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{data?.patient?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Age / Sex:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data?.patient?.age} / {data?.patient?.sex}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Group:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{data?.patient?.bloodGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Height / Weight:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data?.patient?.heightCm}cm / {data?.patient?.weightKg}kg
              </span>
            </div>
          </div>
        </div>

        {/* Adherence & Medications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Medications & Regimen Adherence
            </h2>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              7-Day Adherence: {data?.adherence?.week}%
            </span>
          </div>

          <div className="space-y-2">
            {data?.medications?.length === 0 ? (
              <p className="text-xs text-slate-400">No active medications.</p>
            ) : (
              data?.medications?.map((m: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <Pill className="w-3.5 h-3.5 text-emerald-500" />
                    {m.name} ({m.dose || "Standard dose"}, {m.frequency})
                  </div>
                  <div className="text-slate-400 text-[11px]">{m.instructions || "No special instructions"}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Vitals */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            3. Recent Vital Signs (Last 5 Readings)
          </h2>
          <div className="space-y-2">
            {data?.vitals?.length === 0 ? (
              <p className="text-xs text-slate-400">No vitals logged yet.</p>
            ) : (
              data?.vitals?.slice(0, 5).map((v: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {v.type}: {v.type === "BP" ? `${v.systolic}/${v.diastolic} mmHg` : `${v.value} ${v.unit}`}
                  </span>
                  <span className="text-slate-400">
                    {new Date(v.takenAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
