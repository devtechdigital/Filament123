"use client";

import { AuthGuard } from "@/components/auth-guard";
import { extractSpoolIdFromNfcMessage, nfcSupported } from "@/lib/nfc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScanPage() {
  return (
    <AuthGuard>
      <ScanContent />
    </AuthGuard>
  );
}

function ScanContent() {
  const router = useRouter();
  const [manualSpoolId, setManualSpoolId] = useState("");
  const [status, setStatus] = useState<string>("");

  const startScan = async () => {
    if (!nfcSupported()) {
      setStatus("Web NFC unavailable. Use manual spool ID input.");
      return;
    }

    try {
      const reader = new NDEFReader();
      await reader.scan();
      setStatus("Scanning... hold tag near phone");

      reader.addEventListener("reading", (event) => {
        const spoolId = extractSpoolIdFromNfcMessage(event.message);
        if (!spoolId) {
          setStatus("Tag read but spool ID not found");
          return;
        }
        router.push(`/spool/${spoolId}`);
      });

      reader.addEventListener("readingerror", () => {
        setStatus("Failed to parse NFC tag");
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scan failed");
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Scan NFC</h1>
        <p className="text-sm text-zinc-600">Android Chrome + HTTPS required.</p>
      </header>

      <button className="w-full rounded-lg bg-[var(--brand)] px-3 py-3 font-semibold text-white" onClick={startScan} type="button">
        Start scan
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-3">
        <h2 className="mb-2 font-semibold">Manual fallback</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="ULID"
            value={manualSpoolId}
            onChange={(e) => setManualSpoolId(e.target.value)}
          />
          <button
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold"
            onClick={() => router.push(`/spool/${manualSpoolId.trim()}`)}
            type="button"
          >
            Open
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
    </div>
  );
}
