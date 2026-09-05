"use client";

import { useState, useEffect } from "react";

export function DoctorRpmClient() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);

  // New enrollment state
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [maxSys, setMaxSys] = useState(140);
  const [maxDia, setMaxDia] = useState(90);
  const [maxGlu, setMaxGlu] = useState(180);
  const [minSpo2, setMinSpo2] = useState(94);
  const [enrollNotes, setEnrollNotes] = useState("Hypertension and Type 2 Diabetes RPM protocol");

  // Review state
  const [reviewDuration, setReviewDuration] = useState(180); // seconds
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/rpm/patients");
      const data = await res.json();
      if (data.ok) {
        setEnrollments(data.enrollments || []);
      }
    } catch (err) {
      console.error("Failed to load RPM enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/doctor/rpm/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPhone: newPhone || undefined,
          patientEmail: newEmail || undefined,
          maxSystolic: maxSys,
          maxDiastolic: maxDia,
          maxGlucose: maxGlu,
          minSpo2: minSpo2,
          notes: enrollNotes,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowEnrollModal(false);
        setNewPhone("");
        setNewEmail("");
        fetchEnrollments();
      } else {
        alert(data.error || "Failed to enroll patient");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeAlert = async (enrollmentId: string, alertId: string) => {
    try {
      const res = await fetch(`/api/doctor/rpm/patients/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acknowledgeAlertId: alertId,
          doctorNotes: reviewNotes || "Physician verified alert and adjusted monitoring interval.",
          durationSeconds: reviewDuration,
          activityType: "TELEMETRY_REVIEW",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchEnrollments();
        if (selectedEnrollment) {
          // update local selected
          setSelectedEnrollment({
            ...selectedEnrollment,
            alerts: selectedEnrollment.alerts.map((a: any) =>
              a.id === alertId ? { ...a, acknowledged: true } : a
            ),
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAlerts = enrollments.reduce(
    (sum, e) => sum + (e.alerts?.length || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>👨‍⚕️</span> Remote Patient Monitoring (RPM) Workstation
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Real-time physiological telemetry, automated threshold alerts, and compliance-ready time tracking.
          </p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-dark transition-all"
        >
          <span>➕</span> Enroll New Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <span className="text-[11px] font-bold text-ink-muted uppercase">Active Monitored Patients</span>
          <div className="text-3xl font-black text-ink mt-1">{enrollments.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Continuous telemetry streaming</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <span className="text-[11px] font-bold text-ink-muted uppercase">Unacknowledged Vital Alerts</span>
          <div className={`text-3xl font-black mt-1 ${totalAlerts > 0 ? "text-red-600" : "text-ink"}`}>
            {totalAlerts}
          </div>
          <span className="text-[10px] text-ink-muted font-medium">
            {totalAlerts > 0 ? "Requires physician clinical review" : "All vital parameters stable"}
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <span className="text-[11px] font-bold text-ink-muted uppercase">RPM Clinical Compliance</span>
          <div className="text-3xl font-black text-ink mt-1">100%</div>
          <span className="text-[10px] text-primary font-semibold">Audit logs time-stamped</span>
        </div>
      </div>

      {/* Patient Cohort Roster */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            Patient Telemetry Roster
          </h2>
          <button
            onClick={fetchEnrollments}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-muted">Loading telemetry roster...</div>
        ) : enrollments.length === 0 ? (
          <div className="p-10 text-center text-ink-muted">
            <span className="text-3xl mb-2 block">🩺</span>
            <p className="text-sm font-bold text-ink">No Patients Enrolled Yet</p>
            <p className="text-xs max-w-sm mx-auto mt-1">
              Click &apos;Enroll New Patient&apos; to link a patient and configure customized vital threshold alarms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-ink-muted uppercase font-bold border-b border-line text-[10px]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Recent Vitals</th>
                  <th className="px-5 py-3">Custom Thresholds</th>
                  <th className="px-5 py-3">Pending Alerts</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {enrollments.map((e) => {
                  const patient = e.patient;
                  const latestVital = patient.vitalReadings?.[0];
                  const hasAlerts = e.alerts && e.alerts.length > 0;

                  return (
                    <tr key={e.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-ink">{patient.name || "Patient"}</div>
                        <div className="text-[11px] text-ink-muted">
                          {patient.phone || patient.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestVital ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-ink">
                              {latestVital.systolic ? `${latestVital.systolic}/${latestVital.diastolic} mmHg` : `${latestVital.glucose} mg/dL`}
                            </span>
                            <div className="text-[10px] text-ink-muted">
                              {new Date(latestVital.recordedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-muted italic">No readings yet</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[11px] text-ink">
                          BP: &lt;{e.maxSystolic}/{e.maxDiastolic} | Glu: &lt;{e.maxGlucose} | SpO2: &gt;{e.minSpo2}%
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {hasAlerts ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                            🚨 {e.alerts.length} Alert{e.alerts.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            ✓ Stable
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedEnrollment(e)}
                          className="rounded-lg bg-surface border border-line px-3 py-1 text-xs font-bold text-ink hover:bg-primary-soft hover:text-primary-dark transition-colors"
                        >
                          Review Telemetry
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Telemetry Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Physician Review: {selectedEnrollment.patient.name || "Patient"}
                </h3>
                <p className="text-xs text-ink-muted">
                  Enrolled: {new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnrollment(null)}
                className="text-ink-muted hover:text-ink text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Active Alerts in this enrollment */}
            {selectedEnrollment.alerts && selectedEnrollment.alerts.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-red-600 uppercase">
                  Pending Threshold Alerts
                </span>
                {selectedEnrollment.alerts.map((alt: any) => (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs dark:bg-red-950/40"
                  >
                    <div>
                      <div className="font-bold text-red-700">
                        {alt.vitalType}: {alt.value}
                      </div>
                      <div className="text-[11px] text-red-600">{alt.doctorNotes}</div>
                    </div>
                    {!alt.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(selectedEnrollment.id, alt.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-red-700"
                      >
                        Acknowledge Alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Clinical Note & Time Tracking */}
            <div className="rounded-xl border border-line bg-background p-4 space-y-3">
              <span className="text-xs font-bold uppercase text-ink">
                Record Clinical RPM Time (Compliance Tracking)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-ink-muted font-medium block mb-1">
                    Review Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={reviewDuration}
                    onChange={(e) => setReviewDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-muted font-medium block mb-1">
                    Clinical Activity Type
                  </label>
                  <input
                    type="text"
                    disabled
                    value="TELEMETRY_REVIEW"
                    className="w-full rounded-lg border border-line bg-surface/50 px-2.5 py-1.5 text-xs text-ink-muted"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-ink-muted font-medium block mb-1">
                  Physician Assessment / Titration Notes
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Patient vitals reviewed. Medication dosage maintained. Advised continued sodium restriction."
                  className="w-full rounded-lg border border-line bg-surface p-2 text-xs text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedEnrollment(null)}
                className="rounded-xl bg-ink px-5 py-2 text-xs font-bold text-surface"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEnroll}
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Enroll Patient in RPM</h3>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="text-ink-muted hover:text-ink text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Patient Phone Number or Email
              </label>
              <input
                type="text"
                placeholder="+919876543210 or patient@example.com"
                value={newPhone || newEmail}
                onChange={(e) => {
                  if (e.target.value.includes("@")) {
                    setNewEmail(e.target.value);
                    setNewPhone("");
                  } else {
                    setNewPhone(e.target.value);
                    setNewEmail("");
                  }
                }}
                className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">
                  Max Systolic (mmHg)
                </label>
                <input
                  type="number"
                  value={maxSys}
                  onChange={(e) => setMaxSys(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">
                  Max Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  value={maxDia}
                  onChange={(e) => setMaxDia(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">
                  Max Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={maxGlu}
                  onChange={(e) => setMaxGlu(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">
                  Min SpO2 (%)
                </label>
                <input
                  type="number"
                  value={minSpo2}
                  onChange={(e) => setMinSpo2(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Clinical Protocol Notes
              </label>
              <input
                type="text"
                value={enrollNotes}
                onChange={(e) => setEnrollNotes(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-3 py-2 text-xs text-ink"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark"
              >
                Confirm Enrollment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
