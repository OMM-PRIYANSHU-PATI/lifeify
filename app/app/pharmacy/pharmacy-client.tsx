"use client";

import { useState, useEffect } from "react";

export function PharmacyClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refillCandidates, setRefillCandidates] = useState<any[]>([]);
  const [partners, setPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Order Placement Form
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [chosenPartner, setChosenPartner] = useState("Tata 1mg");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Flat 402, Green Meadows, Indiranagar, Bengaluru - 560038"
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacy/order");
      const data = await res.json();
      if (data.ok) {
        setOrders(data.orders || []);
        setRefillCandidates(data.refillCandidates || []);
        setPartners(data.availablePartners || ["Tata 1mg", "Apollo Pharmacy", "Netmeds"]);

        // Auto-select all low stock candidates by default
        if (data.refillCandidates?.length > 0) {
          setSelectedMeds(data.refillCandidates.map((c: any) => c.medicationId));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleMedSelection = (medId: string) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(selectedMeds.filter((id) => id !== medId));
    } else {
      setSelectedMeds([...selectedMeds, medId]);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeds.length === 0) {
      alert("Please select at least one medication to refill.");
      return;
    }

    const itemsToOrder = refillCandidates
      .filter((c) => selectedMeds.includes(c.medicationId))
      .map((c) => ({
        medicationId: c.medicationId,
        name: c.name,
        qty: c.suggestedRefillQty,
        dose: c.dose,
        priceInr: c.estimatedPriceInr,
      }));

    const totalAmountInr = itemsToOrder.reduce((sum, item) => sum + item.priceInr, 0);

    setSubmitting(true);
    try {
      const res = await fetch("/api/pharmacy/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: chosenPartner,
          items: itemsToOrder,
          deliveryAddress,
          totalAmountInr,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        fetchData();
      } else {
        alert(data.error || "Order failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateDelivery = async (orderId: string) => {
    try {
      const res = await fetch("/api/pharmacy/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "DELIVERED",
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
            <span>📦</span> Pharmacy Refill &amp; E-Commerce Bridges
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Automated low-stock detection, 1-click partner routing (Tata 1mg, Apollo, Netmeds), and stock replenishment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            Express 24h Delivery Partners
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Refill Ordering Card */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handlePlaceOrder}
            className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4"
          >
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Smart Refill Cart</h2>
              <p className="text-xs text-ink-muted">
                Medications identified with ≤10 doses remaining in your current stock inventory.
              </p>
            </div>

            {loading ? (
              <div className="p-4 text-xs text-ink-muted">Checking medication stock levels...</div>
            ) : refillCandidates.length === 0 ? (
              <div className="rounded-xl bg-background p-4 text-xs text-ink-muted text-center">
                ✓ All active medications have sufficient stock. You can still order manual refills.
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                  Select Medicines to Refill:
                </span>
                {refillCandidates.map((c) => (
                  <div
                    key={c.medicationId}
                    onClick={() => toggleMedSelection(c.medicationId)}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      selectedMeds.includes(c.medicationId)
                        ? "border-primary bg-primary-soft/30 text-ink"
                        : "border-line bg-background text-ink-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMeds.includes(c.medicationId)}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-bold text-xs text-ink">{c.name}</div>
                        <div className="text-[11px] text-ink-muted">
                          {c.dose} • In Stock: {c.currentQty} tablets
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-ink">₹{c.estimatedPriceInr}</div>
                      <div className="text-[10px] text-ink-muted">30 tablets pack</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Fulfillment Partner
              </label>
              <select
                value={chosenPartner}
                onChange={(e) => setChosenPartner(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none"
              >
                {partners.map((p) => (
                  <option key={p} value={p}>
                    {p} (Express Delivery)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Delivery Address
              </label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full rounded-xl border border-line bg-background p-2 text-xs text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || selectedMeds.length === 0}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {submitting ? "Placing Refill Order..." : `Transmit Refill Order to ${chosenPartner}`}
            </button>
          </form>
        </div>

        {/* Active Orders & History */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-ink uppercase tracking-wider">
            Refill Order Tracking
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-xs text-ink-muted">
              No orders placed yet. Select medicines on the left to place your first refill.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-ink">{o.partnerName}</span>
                      <div className="text-[10px] text-ink-muted font-mono">{o.trackingNumber}</div>
                    </div>
                    <span
                      className={`rounded px-2.5 py-0.5 text-[10px] font-bold ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="rounded-xl bg-background p-2.5 text-xs space-y-1">
                    {o.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-ink">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.qty} units</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-ink">Total: ₹{o.totalAmountInr}</span>
                    {o.status !== "DELIVERED" && (
                      <button
                        onClick={() => handleSimulateDelivery(o.id)}
                        className="rounded-lg bg-surface border border-line px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary-soft transition-colors"
                        title="Simulates courier delivery event and automatically increments your medicine stock"
                      >
                        Simulate Delivery (Restock) ⚡
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
