"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MaterialCombobox } from "@/components/material-combobox";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SpoolsPage() {
  return (
    <AuthGuard>
      <SpoolsContent />
    </AuthGuard>
  );
}

function SpoolsContent() {
  const searchParams = useSearchParams();
  const selectedSlotId = searchParams.get("slotId") || undefined;

  const [searchText, setSearchText] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [brand, setBrand] = useState("");

  const list = useQuery("spools:listSpools" as any, {
    searchText: searchText || undefined,
    material: materialFilter || undefined,
    brand: brand || undefined,
  });

  const createSpool = useMutation("spools:createSpool" as any);
  const assignSpoolToSlot = useMutation("spools:assignSpoolToSlot" as any);
  const usedMaterials = useQuery("spools:listUsedMaterials" as any, {}) ?? [];

  const [form, setForm] = useState({
    material: "PLA",
    colourName: "White",
    brand: "",
    remainingGrams: "1000",
    notes: "",
    price: "",
    datePurchased: "",
  });

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    await createSpool({
      material: form.material,
      colourName: form.colourName,
      brand: form.brand,
      remainingGrams: Number(form.remainingGrams),
      notes: form.notes || undefined,
      price: form.price ? Number(form.price) : undefined,
      datePurchased: form.datePurchased
        ? new Date(form.datePurchased + "T00:00:00").getTime()
        : undefined,
    });
    setForm({
      material: "PLA",
      colourName: "White",
      brand: "",
      remainingGrams: "1000",
      notes: "",
      price: "",
      datePurchased: "",
    });
  };

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-page-title text-[var(--text)]">Spools</h1>
        {selectedSlotId ? (
          <p className="text-body text-[var(--text-muted)]">Assign mode for slot: {selectedSlotId}</p>
        ) : (
          <p className="text-body text-[var(--text-muted)]">Search, create, and assign spools.</p>
        )}
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3 shadow-lg shadow-black/20">
        <div className="grid grid-cols-1 gap-2">
          <input
            placeholder="Search"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <MaterialCombobox
              value={materialFilter}
              onChange={setMaterialFilter}
              usedMaterials={usedMaterials}
              placeholder="Material filter"
              allowClear
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
            />
            <input
              placeholder="Brand filter"
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-section-title text-[var(--text)]">Create spool</h2>
        <form className="space-y-2" onSubmit={onCreate}>
          <div className="grid grid-cols-2 gap-2">
            <MaterialCombobox
              value={form.material}
              onChange={(v) => setForm((prev) => ({ ...prev, material: v }))}
              usedMaterials={usedMaterials}
              placeholder="Material"
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)] w-full"
            />
            <input
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              placeholder="Colour"
              value={form.colourName}
              onChange={(e) => setForm((prev) => ({ ...prev, colourName: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              placeholder="Remaining grams"
              type="number"
              value={form.remainingGrams}
              onChange={(e) => setForm((prev) => ({ ...prev, remainingGrams: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              placeholder="Price (optional)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <input
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
              placeholder="Date purchased (optional)"
              type="date"
              value={form.datePurchased}
              onChange={(e) => setForm((prev) => ({ ...prev, datePurchased: e.target.value }))}
            />
          </div>
          <textarea
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-dim)]"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <button
            className="rounded-lg bg-[var(--brand)] px-3 py-2 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)]"
            type="submit"
          >
            Create spool
          </button>
        </form>
      </section>

      <section className="space-y-2">
        {(list ?? []).map((spool: any) => (
          <article
            key={spool._id}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-elevated)] p-3 shadow-md shadow-black/15"
          >
            <a
              href={`/spool/${spool.spoolId}`}
              className="block text-card-title text-[var(--text)] hover:text-[var(--brand)] hover:underline"
            >
              {spool.material} / {spool.colourName} ({spool.spoolId})
            </a>
            <p className="text-body text-[var(--text-muted)]">
              {spool.brand} • {spool.remainingGrams}g
              {spool.price != null && ` • $${Number(spool.price).toFixed(2)}`}
              {spool.datePurchased != null &&
                ` • ${new Date(spool.datePurchased).toLocaleDateString()}`}
            </p>
            {selectedSlotId ? (
              <button
                onClick={() => void assignSpoolToSlot({ spoolId: spool.spoolId, slotId: selectedSlotId as any })}
                className="mt-2 rounded-md bg-[var(--brand)] px-2 py-1 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)]"
                type="button"
              >
                Assign to selected slot
              </button>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
