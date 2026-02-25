"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo } from "react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const ensureDefault = useMutation("printers:getOrCreateDefaultPrinter" as any);
  const unloadSlot = useMutation("spools:unloadSlot" as any);
  const dashboard = useQuery("printers:getDashboard" as any, {});

  useEffect(() => {
    void ensureDefault({});
  }, [ensureDefault]);

  const assignmentBySlot = useMemo(() => {
    if (!dashboard?.assignments) return new Map();
    return new Map(dashboard.assignments.map((assignment: any) => [assignment.slotId, assignment]));
  }, [dashboard]);

  if (dashboard === undefined) {
    return <p className="pt-6 text-center text-sm text-zinc-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Filament.home</h1>
        <p className="text-sm text-zinc-600">AMS occupancy and slot control</p>
      </header>

      {!dashboard.printer ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">Creating your printer...</p>
      ) : null}

      {(dashboard.amsUnits ?? []).map((unit: any) => {
        const unitSlots = (dashboard.slots ?? []).filter((slot: any) => slot.amsUnitId === unit._id);
        return (
          <section key={unit._id} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">AMS {unit.index}</h2>
            <div className="grid grid-cols-2 gap-3">
              {unitSlots.map((slot: any) => {
                const assignment = assignmentBySlot.get(slot._id);
                const spool = assignment?.spool;
                return (
                  <article key={slot._id} className="rounded-xl border border-zinc-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Slot {slot.slotNumber}</p>
                      <span
                        className="size-3 rounded-full border border-zinc-300"
                        style={{ backgroundColor: spool ? spool.colourName.toLowerCase() : "#f4f4f5" }}
                      />
                    </div>
                    {spool ? (
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold">{spool.material} / {spool.colourName}</p>
                        <p>{spool.brand}</p>
                        <p>{spool.remainingGrams}g</p>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">Empty</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/spools?slotId=${slot._id}`}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-semibold"
                      >
                        Assign
                      </a>
                      <button
                        onClick={() => void unloadSlot({ slotId: slot._id })}
                        className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-semibold text-white"
                        type="button"
                      >
                        Unload
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
