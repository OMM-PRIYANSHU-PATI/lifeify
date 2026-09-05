"use client";

import { useState } from "react";
import { requestDataExportAction, deleteAccountAction } from "@/lib/actions/export";
import { revokeCaregiverPermissionAction } from "@/lib/actions/caregivers";

interface PrivacyClientProps {
  auditLogs: {
    id: string;
    action: string;
    entity: string | null;
    createdAt: Date | string;
  }[];
  activeGrants: {
    id: string;
    permissionKey: string;
    source: string;
    expiresAt: Date | string | null;
    user: { name: string | null; phone: string | null };
  }[];
  emergencyLogs: {
    id: string;
    accessedAt: Date | string;
    ip: string | null;
  }[];
}

export function PrivacyClient({ auditLogs, activeGrants, emergencyLogs }: PrivacyClientProps) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await requestDataExportAction(format);
      if (res.ok && res.data?.downloadUrl) {
        setDownloadUrl(res.data.downloadUrl);
        setMessage("Data package prepared! Click below to download your complete archive.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Revoke this permission grant immediately?")) {
      await revokeCaregiverPermissionAction(id);
      setMessage("Permission grant revoked.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("DANGER: Are you absolutely certain you want to permanently delete your account and all associated health records? This action cannot be undone.")) {
      await deleteAccountAction();
      window.location.href = "/";
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      {/* Active Sharing Permissions */}
      <div className="lif-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink">Active Data Sharing Grants</h3>
            <p className="text-xs text-ink-muted">
              Revoke doctor or caregiver access at any time.
            </p>
          </div>
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary-dark">
            {activeGrants.length} Active Grants
          </span>
        </div>

        {activeGrants.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">
            No active sharing grants. Your records are entirely private.
          </p>
        ) : (
          <div className="divide-y divide-line/60">
            {activeGrants.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">
                    {g.source === "DOCTOR_CODE" ? "Doctor Consultation" : `Caregiver: ${g.user.name ?? g.user.phone}`}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Scope: <span className="font-semibold text-primary-dark">{g.permissionKey}</span> • Expires: {g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(g.id)}
                  className="rounded px-2.5 py-1 text-xs font-semibold text-crisis hover:bg-crisis/10"
                >
                  Revoke Immediately
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Export Center */}
      <div className="lif-card space-y-3">
        <h3 className="font-bold text-ink text-sm">Download Your Personal Health Data</h3>
        <p className="text-xs text-ink-soft">
          Download a complete, portable copy of your health metrics, medical records, prescription history, and check-in entries in JSON format.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleExport("json")}
            disabled={loading}
            className="lif-btn-primary py-2 px-4 text-xs font-semibold"
          >
            {loading ? "Exporting..." : "Generate Complete JSON Export"}
          </button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download="lifeify-health-export.json"
              className="lif-btn-secondary py-2 px-4 text-xs font-semibold text-primary-dark"
            >
              📥 Download File
            </a>
          )}
        </div>
      </div>

      {/* Immutable Access Audit Log */}
      <div className="lif-card space-y-3">
        <h3 className="font-bold text-ink text-sm">Immutable Security & Access Audit Log</h3>
        <p className="text-xs text-ink-muted">
          Cryptographic trail of every action performed on your account by you, your doctors, or caregivers.
        </p>

        <div className="max-h-60 overflow-y-auto divide-y divide-line/60 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink">{log.action}</span>
                {log.entity && <span className="text-[11px] text-ink-muted ml-2">({log.entity})</span>}
              </div>
              <span className="text-[11px] text-ink-muted">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Access Log */}
      {emergencyLogs.length > 0 && (
        <div className="lif-card space-y-3">
          <h3 className="font-bold text-ink text-sm">Emergency Medical Card Access Trail</h3>
          <div className="divide-y divide-line/60 text-xs">
            {emergencyLogs.map((el) => (
              <div key={el.id} className="py-2 flex items-center justify-between">
                <span className="text-ink">QR Emergency Card Scanned</span>
                <span className="text-ink-muted">{new Date(el.accessedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="lif-card border border-crisis/30 bg-crisis/5 space-y-3">
        <h3 className="font-bold text-crisis text-sm">Account Deletion & Data Purge</h3>
        <p className="text-xs text-ink-soft leading-relaxed">
          Permanently delete your LIFEIFY account. All health profiles, private medical files, vitals, and logs will be immediately and irreversibly purged from our databases.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="lif-btn-secondary border-crisis text-crisis hover:bg-crisis hover:text-white text-xs font-bold py-2 px-4"
        >
          Permanently Delete My Account
        </button>
      </div>
    </div>
  );
}
