"use client";

import { AuthGuard } from "@/components/auth-guard";
import { nfcSupported } from "@/lib/nfc";
import { useMutation } from "convex/react";
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
  const [busy, setBusy] = useState(false);
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

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-600">LAN deployment and device capability</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">AMS units</h2>
        <button
          className="rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={onAddAms}
        >
          Add AMS Unit
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">NFC support</h2>
        <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${supportsNfc ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {supportsNfc ? "Web NFC available" : "Web NFC unavailable"}
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">LAN HTTPS setup</h2>
        <a className="text-sm text-[var(--brand)] underline" href="/setup">
          Open setup documentation
        </a>
      </section>

      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
    </div>
  );
}
