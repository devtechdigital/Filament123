"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MaterialCombobox } from "@/components/material-combobox";
import { writeSpoolTag } from "@/lib/nfc";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
  const usedMaterials = useQuery("spools:listUsedMaterials" as any, {}) ?? [];
  const updateSpool = useMutation("spools:updateSpool" as any);
  const assignSpoolToSlot = useMutation("spools:assignSpoolToSlot" as any);

  const [status, setStatus] = useState<string | null>(null);
  const [material, setMaterial] = useState("");

  if (result === undefined) {
    return <p className="pt-6 text-center text-body text-[var(--text-muted)]">Loading spool...</p>;
  }

  if (!result.spool) {
    return (
      <div className="space-y-2">
        <h1 className="text-section-title text-[var(--text)]">Spool not found</h1>
        <a className="text-body text-[var(--brand)] underline hover:text-[var(--brand-hover)]" href={`/spools?search=${spoolId}`}>
          Create this spool in /spools
        </a>
      </div>
    );
  }

  const spool = result.spool;

  useEffect(() => {
    setMaterial(spool.material);
  }, [spool.material]);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const priceVal = formData.get("price");
    const dateVal = formData.get("datePurchased");
    await updateSpool({
      spoolId,
      patch: {
        material,
        colourName: String(formData.get("colourName") ?? ""),
        brand: String(formData.get("brand") ?? ""),
        remainingGrams: Number(formData.get("remainingGrams") ?? 0),
        notes: String(formData.get("notes") ?? ""),
        price: priceVal && String(priceVal).trim() ? Number(priceVal) : undefined,
        datePurchased:
          dateVal && String(dateVal).trim()
            ? new Date(String(dateVal) + "T00:00:00").getTime()
            : undefined,
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
        <h1 className="text-page-title text-[var(--text)]">Spool {spool.spoolId}</h1>
        <p className="text-body text-[var(--text-muted)]">
          {result.location
            ? `AMS ${result.location.amsUnitIndex}, slot ${result.location.slotNumber}`
            : "Not currently assigned"}
        </p>
      </header>

      <form
        className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3 shadow-lg shadow-black/20"
        onSubmit={onSave}
      >
        <MaterialCombobox
          value={material}
          onChange={setMaterial}
          usedMaterials={usedMaterials}
          placeholder="Material"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)]"
        />
        <input
          name="colourName"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)]"
          defaultValue={spool.colourName}
          required
        />
        <input
          name="brand"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)]"
          defaultValue={spool.brand}
          required
        />
        <input
          name="remainingGrams"
          type="number"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)]"
          defaultValue={spool.remainingGrams}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price (optional)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
            defaultValue={spool.price ?? ""}
          />
          <input
            name="datePurchased"
            type="date"
            placeholder="Date purchased (optional)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
            defaultValue={
              spool.datePurchased != null
                ? new Date(spool.datePurchased).toISOString().slice(0, 10)
                : ""
            }
          />
        </div>
        <textarea
          name="notes"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)]"
          defaultValue={spool.notes ?? ""}
        />
        <button
          className="rounded-lg bg-[var(--brand)] px-3 py-2 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)]"
          type="submit"
        >
          Save spool
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-section-title text-[var(--text)]">Assign to slot</h2>
        <div className="grid grid-cols-2 gap-2">
          {(slots ?? []).map((slot: any) => (
            <button
              key={slot.slotId}
              className="rounded-md border border-[var(--border)] px-2 py-2 text-button text-[var(--text)] transition-colors hover:bg-[var(--brand-muted)] hover:border-[var(--brand)]"
              type="button"
              onClick={() => void assignSpoolToSlot({ spoolId, slotId: slot.slotId })}
            >
              AMS {slot.amsUnitIndex} / Slot {slot.slotNumber}
            </button>
          ))}
        </div>
      </section>

      <button
        className="w-full rounded-lg bg-[var(--brand)] px-3 py-3 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)]"
        onClick={onWriteNfc}
        type="button"
      >
        Write NFC tag
      </button>

      {status ? <p className="text-caption text-[var(--text-muted)]">{status}</p> : null}
    </div>
  );
}
