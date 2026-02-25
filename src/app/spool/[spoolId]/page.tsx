"use client";

import { AuthGuard } from "@/components/auth-guard";
import { writeSpoolTag } from "@/lib/nfc";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SpoolDetailPage() {
  return (
    <AuthGuard>
      <SpoolDetailContent />
    </AuthGuard>
  );
}

function SpoolDetailContent() {
  const params = useParams<{ spoolId: string }>();
  const spoolId = params.spoolId;

  const result = useQuery("spools:getSpoolBySpoolId" as any, { spoolId });
  const slots = useQuery("spools:listAssignableSlots" as any, {});
  const updateSpool = useMutation("spools:updateSpool" as any);
  const assignSpoolToSlot = useMutation("spools:assignSpoolToSlot" as any);

  const [status, setStatus] = useState<string | null>(null);

  if (result === undefined) {
    return <p className="pt-6 text-center text-sm text-zinc-500">Loading spool...</p>;
  }

  if (!result.spool) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold">Spool not found</h1>
        <a className="text-sm text-[var(--brand)] underline" href={`/spools?search=${spoolId}`}>
          Create this spool in /spools
        </a>
      </div>
    );
  }

  const spool = result.spool;

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateSpool({
      spoolId,
      patch: {
        material: String(formData.get("material") ?? ""),
        colourName: String(formData.get("colourName") ?? ""),
        brand: String(formData.get("brand") ?? ""),
        remainingGrams: Number(formData.get("remainingGrams") ?? 0),
        notes: String(formData.get("notes") ?? ""),
      },
    });
    setStatus("Saved");
  };

  const onWriteNfc = async () => {
    try {
      const url = await writeSpoolTag(spoolId);
      setStatus(`Tag written: ${url}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to write NFC tag");
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-xl font-bold">Spool {spool.spoolId}</h1>
        <p className="text-sm text-zinc-600">
          {result.location
            ? `AMS ${result.location.amsUnitIndex}, slot ${result.location.slotNumber}`
            : "Not currently assigned"}
        </p>
      </header>

      <form className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3" onSubmit={onSave}>
        <input name="material" className="w-full rounded-lg border border-zinc-300 px-3 py-2" defaultValue={spool.material} required />
        <input name="colourName" className="w-full rounded-lg border border-zinc-300 px-3 py-2" defaultValue={spool.colourName} required />
        <input name="brand" className="w-full rounded-lg border border-zinc-300 px-3 py-2" defaultValue={spool.brand} required />
        <input
          name="remainingGrams"
          type="number"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          defaultValue={spool.remainingGrams}
          required
        />
        <textarea name="notes" className="w-full rounded-lg border border-zinc-300 px-3 py-2" defaultValue={spool.notes ?? ""} />
        <button className="rounded-lg bg-[var(--brand)] px-3 py-2 font-semibold text-white" type="submit">
          Save spool
        </button>
      </form>

      <section className="rounded-2xl border border-zinc-200 bg-white p-3">
        <h2 className="mb-2 font-semibold">Assign to slot</h2>
        <div className="grid grid-cols-2 gap-2">
          {(slots ?? []).map((slot: any) => (
            <button
              key={slot.slotId}
              className="rounded-md border border-zinc-300 px-2 py-2 text-xs font-semibold"
              type="button"
              onClick={() => void assignSpoolToSlot({ spoolId, slotId: slot.slotId })}
            >
              AMS {slot.amsUnitIndex} / Slot {slot.slotNumber}
            </button>
          ))}
        </div>
      </section>

      <button className="w-full rounded-lg bg-zinc-900 px-3 py-3 font-semibold text-white" onClick={onWriteNfc} type="button">
        Write NFC tag
      </button>

      {status ? <p className="text-xs text-zinc-600">{status}</p> : null}
    </div>
  );
}
