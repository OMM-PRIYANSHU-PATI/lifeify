"use client";

import { useState } from "react";
import { createFamilyHouseholdAction, inviteFamilyMemberAction } from "@/lib/actions/family";
import { grantCaregiverPermissionAction, revokeCaregiverPermissionAction } from "@/lib/actions/caregivers";

interface FamilyMemberItem {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    phone: string | null;
  };
}

interface CaregiverGrantItem {
  id: string;
  permissionKey: string;
  expiresAt: Date | string | null;
  user: {
    id: string;
    name: string | null;
    phone: string | null;
  };
}

export function FamilyClient({
  family,
  caregiverGrants,
}: {
  family: {
    id: string;
    name: string;
    members: FamilyMemberItem[];
  } | null;
  caregiverGrants: CaregiverGrantItem[];
}) {
  const [showCreateFamily, setShowCreateFamily] = useState(!family);
  const [familyName, setFamilyName] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"parent" | "child" | "spouse" | "dependent">("parent");

  const [showCaregiverModal, setShowCaregiverModal] = useState(false);
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [caregiverDuration, setCaregiverDuration] = useState(6);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["VIEW_VITALS", "VIEW_MEDS"]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFamilyHouseholdAction(familyName);
      if (res.ok) setShowCreateFamily(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    setLoading(true);
    try {
      const res = await inviteFamilyMemberAction({
        familyId: family.id,
        phone: invitePhone,
        name: inviteName,
        role: inviteRole,
      });
      if (res.ok) {
        setShowInviteModal(false);
        setInvitePhone("");
        setInviteName("");
        setMessage("Family member invited!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await grantCaregiverPermissionAction({
        caregiverPhone,
        durationMonths: caregiverDuration,
        permissions: selectedPermissions as ("VIEW_VITALS" | "VIEW_MEDS" | "MANAGE_MEDS" | "EMERGENCY_ACCESS")[],
      });
      if (res.ok) {
        setShowCaregiverModal(false);
        setCaregiverPhone("");
        setMessage("Caregiver permissions granted successfully!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeGrant = async (id: string) => {
    if (confirm("Revoke this caregiver's access immediately?")) {
      await revokeCaregiverPermissionAction(id);
      setMessage("Access revoked.");
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      {/* Household Section */}
      <div className="lif-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink">
              {family ? `${family.name} Household` : "Family Household"}
            </h3>
            <p className="text-xs text-ink-muted">
              {family ? `${family.members.length} members connected` : "Manage family health, eldercare, and dependents."}
            </p>
          </div>
          {family ? (
            <button
              onClick={() => setShowInviteModal(true)}
              className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
            >
              + Invite Member
            </button>
          ) : (
            <button
              onClick={() => setShowCreateFamily(true)}
              className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
            >
              + Create Household
            </button>
          )}
        </div>

        {family ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {family.members.map((m) => (
              <div key={m.id} className="rounded-lg border border-line bg-surface-subtle p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{m.user.name ?? "Member"}</span>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-primary-dark">
                    {m.role}
                  </span>
                </div>
                <p className="text-ink-muted text-[11px]">{m.user.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted py-4 text-center">
            You are not currently part of a family household. Create one to share health records safely.
          </p>
        )}
      </div>

      {/* Caregiver Access Section */}
      <div className="lif-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink">Caregiver Access & Permissions</h3>
            <p className="text-xs text-ink-muted">
              Grant time-bound, revocable access to a nurse, family caregiver, or guardian (maximum 12 months).
            </p>
          </div>
          <button
            onClick={() => setShowCaregiverModal(true)}
            className="lif-btn-secondary px-3 py-1.5 text-xs font-semibold"
          >
            + Grant Caregiver Access
          </button>
        </div>

        {caregiverGrants.length === 0 ? (
          <p className="text-xs text-ink-muted py-6 text-center">
            No active caregiver permissions. You maintain 100% private data isolation.
          </p>
        ) : (
          <div className="divide-y divide-line/60">
            {caregiverGrants.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">
                    Caregiver: {g.user.name ?? g.user.phone}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Permission Scope: <span className="font-semibold text-primary-dark">{g.permissionKey}</span> • Expires: {g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeGrant(g.id)}
                  className="rounded px-2.5 py-1 text-xs font-semibold text-crisis hover:bg-crisis/10"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Household Modal */}
      {showCreateFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Create Family Household</h3>
            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Household Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="lif-input w-full"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Creating..." : "Create Household"}
                </button>
                {family && (
                  <button type="button" onClick={() => setShowCreateFamily(false)} className="lif-btn-secondary py-2">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Invite Family Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Member Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Father, Mother, Daughter"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Relationship</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="lif-input w-full"
                >
                  <option value="parent">Parent</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="dependent">Dependent</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Sending..." : "Add to Household"}
                </button>
                <button type="button" onClick={() => setShowInviteModal(false)} className="lif-btn-secondary py-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Caregiver Modal */}
      {showCaregiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Grant Caregiver Access</h3>
            <form onSubmit={handleGrantCaregiver} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Caregiver Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Duration (Max 12 Months)</label>
                <select
                  value={caregiverDuration}
                  onChange={(e) => setCaregiverDuration(Number(e.target.value))}
                  className="lif-input w-full"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (Maximum)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Permitted Scopes</label>
                <div className="space-y-1.5 pt-1">
                  {[
                    { key: "VIEW_VITALS", label: "View Vitals & Biometrics" },
                    { key: "VIEW_MEDS", label: "View Medication Schedules" },
                    { key: "MANAGE_MEDS", label: "Log Doses & Refill Requests" },
                    { key: "EMERGENCY_ACCESS", label: "Emergency Medical Card Access" },
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="text-ink">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading || selectedPermissions.length === 0} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Granting..." : "Grant Permissions"}
                </button>
                <button type="button" onClick={() => setShowCaregiverModal(false)} className="lif-btn-secondary py-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
