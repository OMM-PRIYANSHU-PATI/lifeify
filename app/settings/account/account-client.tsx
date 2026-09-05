"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldAlert, Laptop, Smartphone, Trash2, LogOut, CheckCircle2 } from "lucide-react";

interface AccountInfo {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  plan: string;
  createdAt: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  current: boolean;
  lastActive: string;
}

export function AccountClient() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/account").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
    ])
      .then(([accData, sessData]) => {
        if (accData.ok) setAccount(accData.account);
        if (sessData.ok) setSessions(sessData.sessions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTerminateOtherSessions = async () => {
    try {
      await fetch("/api/sessions", { method: "POST" });
      alert("Other sessions terminated.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") return;
    setDeleting(true);

    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-ink-muted text-sm">Loading account details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          👤 Account & Security
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Manage your identity, device sessions, security controls, and personal data lifecycle.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-surface-subtle rounded-xl">
            <span className="text-ink-muted block">Full Name</span>
            <span className="font-semibold text-ink mt-0.5 block">
              {account?.name || "Not specified"}
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl">
            <span className="text-ink-muted block">Phone / Mobile</span>
            <span className="font-semibold text-ink mt-0.5 block">
              {account?.phone || "—"}
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl">
            <span className="text-ink-muted block">Subscription Plan</span>
            <span className="font-semibold text-primary-dark mt-0.5 block">
              {account?.plan || "FREE"}
            </span>
          </div>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Active Logged-in Devices
          </h2>
          <button
            onClick={handleTerminateOtherSessions}
            className="text-xs text-crisis font-semibold hover:underline"
          >
            Log Out Other Devices
          </button>
        </div>

        <div className="divide-y divide-line">
          {sessions.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-subtle rounded-lg text-ink-soft">
                  {s.device.includes("Mobile") ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink flex items-center gap-2">
                    {s.device}
                    {s.current && (
                      <span className="px-2 py-0.5 bg-primary-soft text-primary-dark text-[10px] font-bold rounded-full">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    IP: {s.ip} • Last active {new Date(s.lastActive).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl border border-crisis/30 bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-crisis flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-xs text-ink-soft">
          Permanent account deletion per DPDP Act Section 12 right to erasure. This action cannot be undone and purges all health telemetry, files, and prescription archives.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="lif-btn-danger"
        >
          Delete Account & Purge Data
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 border border-line shadow-xl space-y-4 animate-fadeIn">
            <h3 className="font-bold text-base text-ink">Confirm Account Deletion</h3>
            <p className="text-xs text-ink-soft">
              Type <strong className="text-crisis">DELETE MY ACCOUNT</strong> below to permanently erase your records.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="lif-input font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="lif-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || deleting}
                className="lif-btn-danger disabled:opacity-50"
              >
                {deleting ? "Purging..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
