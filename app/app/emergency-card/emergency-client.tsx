"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, ShieldCheck, QrCode, Share2, Copy, RefreshCw, Plus, Trash2, Phone, Check } from "lucide-react";

interface Contact {
  name: string;
  phone: string;
  relation: string;
}

export function EmergencyCardClient() {
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [importantInfo, setImportantInfo] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [slug, setSlug] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [revoked, setRevoked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");

  const loadCard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emergency-card");
      const data = await res.json();
      if (data.ok && data.card) {
        const c = data.card;
        setBloodGroup(c.bloodGroup || "");
        setAllergies(c.allergies ? (Array.isArray(JSON.parse(c.allergies)) ? JSON.parse(c.allergies).join(", ") : c.allergies) : "");
        setImportantInfo(c.importantInfo || "");
        setSlug(c.slug || "");
        setRevoked(c.revoked);
        if (c.contacts) {
          setContacts(c.contacts.map((ct: any) => ({ name: ct.name, phone: ct.phone, relation: ct.relation || "" })));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, []);

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { name: "", phone: "", relation: "Family" }]);
  };

  const handleUpdateContact = (index: number, field: keyof Contact, value: string) => {
    setContacts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const allergyList = allergies.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/emergency-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup,
          allergies: allergyList,
          importantInfo,
          contacts,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Emergency card updated successfully!");
        setRevoked(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateShare = async () => {
    try {
      const res = await fetch("/api/emergency-card/share", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setShareUrl(data.shareUrl);
        setQrDataUrl(data.qrDataUrl);
        setSlug(data.slug);
        setRevoked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this emergency link? Responders scanning existing QR stickers will no longer see your data.")) return;
    try {
      const res = await fetch("/api/emergency-card/revoke", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setRevoked(true);
        setShareUrl("");
        setQrDataUrl("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Emergency Medical ID & QR
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Life-critical information accessible to first responders without unlocking your phone.
          </p>
        </div>
        <button
          onClick={handleGenerateShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          View QR / Share Link
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
          {msg}
        </div>
      )}

      {/* Share / QR Modal Area */}
      {shareUrl && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-500" />
              Your Active Emergency QR Code
            </h2>
            <button
              onClick={handleRevoke}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Revoke Link
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {qrDataUrl && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Image src={qrDataUrl} alt="Emergency QR Code" width={144} height={144} unoptimized className="w-36 h-36" />
              </div>
            )}
            <div className="space-y-2 flex-1 w-full">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or screenshot this QR code to place on your helmet, wallet, or phone lockscreen.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono select-all"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            1. Medical Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Drug / Food Allergies (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Penicillin, Sulfa, Peanuts"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Critical Emergency Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Has pacemaker implanted, asthmatic, carry EpiPen"
              value={importantInfo}
              onChange={(e) => setImportantInfo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              2. Emergency Contacts (Prioritized)
            </h2>
            <button
              type="button"
              onClick={handleAddContact}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="p-4 border border-dashed rounded-xl text-center text-xs text-slate-400">
              No emergency contacts added. First responders will look here to notify family.
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    required
                    value={c.name}
                    onChange={(e) => handleUpdateContact(idx, "name", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (+91...)"
                    required
                    value={c.phone}
                    onChange={(e) => handleUpdateContact(idx, "phone", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={c.relation}
                    onChange={(e) => handleUpdateContact(idx, "relation", e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? "Saving..." : "Save Emergency ID"}
          </button>
        </div>
      </form>
    </div>
  );
}
