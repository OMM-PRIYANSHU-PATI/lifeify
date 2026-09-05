"use client";

import { useState, useEffect } from "react";

export function LabsClient() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);

  // Booking Form State
  const [partner, setPartner] = useState("Thyrocare");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("07:00 AM - 09:00 AM");
  const [address, setAddress] = useState("Flat 402, Green Meadows, Bengaluru, Karnataka");
  const [name, setName] = useState("John Doe");
  const [phone, setPhone] = useState("+919876543210");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, bookRes] = await Promise.all([
        fetch("/api/labs/catalog"),
        fetch("/api/labs/book"),
      ]);
      const catData = await catRes.json();
      const bookData = await bookRes.json();
      if (catData.ok) setCatalog(catData.catalog || []);
      if (bookData.ok) setBookings(bookData.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    setBookingInProgress(true);
    try {
      const res = await fetch("/api/labs/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: selectedTest.id,
          partnerName: partner,
          scheduledDate: date,
          timeSlot,
          address,
          patientName: name,
          patientPhone: phone,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedTest(null);
        fetchData();
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleSimulateWebhook = async (bookingId: string) => {
    try {
      const res = await fetch("/api/labs/webhook/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          biomarkers: {
            hba1c: 5.7,
            fastingGlucose: 96,
            totalCholesterol: 182,
            hdl: 52,
            ldl: 106,
            triglycerides: 120,
            status: "ALL_IN_RANGE",
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>🧪</span> Diagnostic Lab Partnerships
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Certified home phlebotomy sample collection and direct electronic lab report ingestion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            NABL &amp; CAP Accredited Partners
          </span>
        </div>
      </div>

      {/* Test Catalog */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-ink uppercase tracking-wider">
          Available Diagnostic Health Panels
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
            Loading diagnostic catalog...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((test) => (
              <div
                key={test.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary-soft text-primary-dark px-2 py-0.5 text-[10px] font-black uppercase">
                      {test.category.replace("_", " ")}
                    </span>
                    <span className="text-sm font-black text-ink">₹{test.partnerPriceInr}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink">{test.name}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{test.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-muted pt-1">
                    <span>💧 {test.sampleType}</span>
                    <span>•</span>
                    <span>{test.fastingRequired ? "⚠️ Fasting Required (8-10h)" : "✓ Non-fasting"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      if (test.partnerLabs && test.partnerLabs[0]) {
                        setPartner(test.partnerLabs[0]);
                      }
                    }}
                    className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
                  >
                    Schedule Home Phlebotomist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="space-y-3 pt-4 border-t border-line">
        <h2 className="text-base font-bold text-ink uppercase tracking-wider">
          My Diagnostic Bookings &amp; Reports
        </h2>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-xs text-ink-muted">
            No lab tests scheduled yet. Pick a panel above to schedule home sample collection.
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm divide-y divide-line">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{b.test?.name}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        b.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-ink-muted mt-1">
                    Partner: <span className="font-semibold text-ink">{b.partnerName}</span> | Scheduled:{" "}
                    <span className="font-semibold text-ink">
                      {new Date(b.scheduledDate).toLocaleDateString()} ({b.timeSlot})
                    </span>
                  </div>
                  {b.resultSummary && (
                    <div className="mt-2 rounded-lg bg-background p-2 text-[11px] text-ink font-mono">
                      Results Ingested: HbA1c: {b.resultSummary.hba1c}%, Fasting Glucose: {b.resultSummary.fastingGlucose} mg/dL, Total Cholesterol: {b.resultSummary.totalCholesterol} mg/dL (Synchronized to Medical Vault)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {b.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleSimulateWebhook(b.id)}
                      className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft transition-colors"
                      title="Simulates partner lab API callback result ingestion"
                    >
                      Simulate Partner Result Ingestion ⚡
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBook}
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Schedule Home Collection</h3>
                <p className="text-xs text-ink-muted">{selectedTest.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="text-ink-muted hover:text-ink text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Select Lab Network Partner
              </label>
              <select
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none"
              >
                {selectedTest.partnerLabs?.map((lab: string) => (
                  <option key={lab} value={lab}>
                    {lab}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Collection Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background px-2 py-1.5 text-xs text-ink"
                >
                  <option value="06:30 AM - 08:30 AM">06:30 AM - 08:30 AM</option>
                  <option value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Home Collection Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-line bg-background p-2 text-xs text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink"
                />
              </div>
            </div>

            <div className="rounded-xl bg-background p-3 flex justify-between items-center text-xs">
              <span className="text-ink-muted">Total Partner Diagnostic Fee:</span>
              <span className="font-extrabold text-ink text-sm">₹{selectedTest.partnerPriceInr}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingInProgress}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {bookingInProgress ? "Booking..." : "Confirm Phlebotomist Booking"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
