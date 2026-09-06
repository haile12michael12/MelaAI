import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function SubscriptionsPage() { return <RoutePlaceholder title="Subscriptions" />; }
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Subscription } from "@/types";
import { formatCurrency } from "@/lib/finance/intelligence";
import { RefreshCw, Plus, Calendar, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function load() {
      if (!user) return setLoading(false);
      try {
        const res = await fetch("/api/subscriptions", {
          headers: { Authorization: `Bearer ${user.idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(Array.isArray(data) ? data : data?.subscriptions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const monthlyBurn = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      const c = s.cost || 0;
      return sum + (s.billingCycle === "yearly" ? c / 12 : c);
    }, 0);
  }, [subscriptions]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cost) return;

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          cost: parseFloat(cost),
          billingCycle,
          nextBillingDate,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setSubscriptions((prev) => [
          ...prev,
          {
            id: created.id || String(Date.now()),
            name: name.trim(),
            cost: parseFloat(cost),
            billingCycle,
            nextBillingDate,
            icon: null,
            createdAt: Date.now(),
          },
        ]);
        setName("");
        setCost("");
        setShowAdd(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.idToken || ""}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Subscriptions & Recurring Bills
          </h1>
          <p className="text-xs text-neutral-500">
            Telecom packages, streaming services & recurring utility commitments in ETB
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Burn Rate Summary Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-medium text-neutral-500">Effective Monthly Burn</span>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {formatCurrency(monthlyBurn, "ETB")}
              <span className="text-xs font-normal text-neutral-400"> / month</span>
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-xl bg-neutral-50 px-4 py-2 dark:bg-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase">Active Subscriptions</span>
              <p className="text-base font-bold text-neutral-900 dark:text-white">{subscriptions.length}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 px-4 py-2 dark:bg-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase">Annualized Total</span>
              <p className="text-base font-bold text-neutral-900 dark:text-white">{formatCurrency(monthlyBurn * 12, "ETB")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-xs text-neutral-400 dark:border-neutral-700">
            No recurring subscriptions tracked yet. Add your telecom package, internet, or streaming bill.
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{sub.name}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {sub.billingCycle}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(sub.cost, "ETB")}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Renews: {sub.nextBillingDate || "Ongoing"}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="flex items-center gap-1 text-[11px] text-red-500 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Track Subscription</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ethio Telecom Unlimited, DSTV Ethiopia, Netflix"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Cost (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="900"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Next Billing Date</label>
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}