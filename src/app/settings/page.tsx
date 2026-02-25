"use client";

import { AuthGuard } from "@/components/auth-guard";
import { nfcSupported } from "@/lib/nfc";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const addAmsUnit = useMutation("printers:addAmsUnit" as any);
  const deleteAmsUnit = useMutation("printers:deleteAmsUnit" as any);
  const dashboard = useQuery("printers:getDashboard" as any, {});
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const supportsNfc = useMemo(() => (typeof window !== "undefined" ? nfcSupported() : false), []);

  const onAddAms = async () => {
    setBusy(true);
    try {
      const result = await addAmsUnit({});
      setStatus(`Added AMS ${result.index}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to add AMS");
    } finally {
      setBusy(false);
    }
  };

  const onDeleteAms = async (amsUnitId: string) => {
    if (!confirm("Delete this AMS unit and unassign any spools in its slots?")) return;
    setDeletingId(amsUnitId);
    try {
      await deleteAmsUnit({ amsUnitId: amsUnitId as any });
      setStatus("AMS unit deleted");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete AMS unit");
    } finally {
      setDeletingId(null);
    }
  };

  const amsUnits = dashboard?.amsUnits ?? [];

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-page-title text-[var(--text)]">Settings</h1>
        <p className="text-body text-[var(--text-muted)]">LAN deployment and device capability</p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-4 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-section-title text-[var(--text)]">AMS units</h2>
        <div className="space-y-2">
          {amsUnits.map((unit: { _id: string; index: number }) => (
            <div
              key={unit._id}
              className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2"
            >
              <span className="text-body text-[var(--text)]">AMS {unit.index}</span>
              <button
                className="rounded-md border border-red-500/50 px-2 py-1 text-button text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                type="button"
                disabled={deletingId === unit._id || busy}
                onClick={() => void onDeleteAms(unit._id)}
              >
                {deletingId === unit._id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-3 rounded-lg bg-[var(--brand)] px-3 py-2 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)] disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={onAddAms}
        >
          Add AMS Unit
        </button>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-4 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-section-title text-[var(--text)]">NFC support</h2>
        <p
          className={`inline-block rounded-full px-3 py-1 text-caption font-semibold ${
            supportsNfc
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {supportsNfc ? "Web NFC available" : "Web NFC unavailable"}
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-4 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-section-title text-[var(--text)]">LAN HTTPS setup</h2>
        <a className="text-body text-[var(--brand)] underline hover:text-[var(--brand-hover)]" href="/setup">
          Open setup documentation
        </a>
      </section>

      {status ? <p className="text-body text-[var(--text-muted)]">{status}</p> : null}
    </div>
  );
}
