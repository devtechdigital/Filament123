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
    return <p className="pt-6 text-center text-body text-[var(--text-muted)]">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-page-title text-[var(--text)]">Filament.home</h1>
        <p className="text-body text-[var(--text-muted)]">AMS occupancy and slot control</p>
      </header>

      {!dashboard.printer ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] p-4 text-body shadow-lg shadow-black/20">
          Creating your printer...
        </p>
      ) : null}

      {(dashboard.amsUnits ?? []).map((unit: any) => {
        const unitSlots = (dashboard.slots ?? []).filter((slot: any) => slot.amsUnitId === unit._id);
        return (
          <section
            key={unit._id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3 shadow-lg shadow-black/20"
          >
            <h2 className="mb-3 text-section-title text-[var(--text)]">AMS {unit.index}</h2>
            <div className="grid grid-cols-2 gap-3">
              {unitSlots.map((slot: any) => {
                const assignment = assignmentBySlot.get(slot._id);
                const spool = assignment?.spool;
                return (
                  <article
                    key={slot._id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 shadow-md shadow-black/15"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-card-title text-[var(--text)]">Slot {slot.slotNumber}</p>
                      <span
                        className="size-3 rounded-full border border-[var(--border)]"
                        style={{ backgroundColor: spool ? spool.colourName.toLowerCase() : "var(--border)" }}
                      />
                    </div>
                    {spool ? (
                      <div className="space-y-1 text-caption">
                        <p className="font-semibold text-[var(--text)]">{spool.material} / {spool.colourName}</p>
                        <p className="text-[var(--text-muted)]">{spool.brand}</p>
                        <p className="text-[var(--text-muted)]">{spool.remainingGrams}g</p>
                      </div>
                    ) : (
                      <p className="text-caption text-[var(--text-dim)]">Empty</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/spools?slotId=${slot._id}`}
                        className="rounded-md border border-[var(--border)] px-2 py-1 text-button text-[var(--text)] transition-colors hover:bg-[var(--brand-muted)] hover:border-[var(--brand)]"
                      >
                        Assign
                      </a>
                      <button
                        onClick={() => void unloadSlot({ slotId: slot._id })}
                        className="rounded-md bg-[var(--brand)] px-2 py-1 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)]"
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
