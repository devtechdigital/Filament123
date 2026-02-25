"use client";

import { AuthGuard } from "@/components/auth-guard";
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
  const [material, setMaterial] = useState("");
  const [brand, setBrand] = useState("");

  const list = useQuery("spools:listSpools" as any, {
    searchText: searchText || undefined,
    material: material || undefined,
    brand: brand || undefined,
  });

  const createSpool = useMutation("spools:createSpool" as any);
  const assignSpoolToSlot = useMutation("spools:assignSpoolToSlot" as any);

  const [form, setForm] = useState({
    material: "PLA",
    colourName: "White",
    brand: "",
    remainingGrams: "1000",
    notes: "",
  });

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    await createSpool({
      material: form.material,
      colourName: form.colourName,
      brand: form.brand,
      remainingGrams: Number(form.remainingGrams),
      notes: form.notes || undefined,
    });
    setForm({ material: "PLA", colourName: "White", brand: "", remainingGrams: "1000", notes: "" });
  };

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Spools</h1>
        {selectedSlotId ? (
          <p className="text-sm text-zinc-600">Assign mode for slot: {selectedSlotId}</p>
        ) : (
          <p className="text-sm text-zinc-600">Search, create, and assign spools.</p>
        )}
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2">
          <input
            placeholder="Search"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Material filter"
              className="rounded-lg border border-zinc-300 px-3 py-2"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
            <input
              placeholder="Brand filter"
              className="rounded-lg border border-zinc-300 px-3 py-2"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-3">
        <h2 className="mb-2 font-semibold">Create spool</h2>
        <form className="space-y-2" onSubmit={onCreate}>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Material"
              value={form.material}
              onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Colour"
              value={form.colourName}
              onChange={(e) => setForm((prev) => ({ ...prev, colourName: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Remaining grams"
              type="number"
              value={form.remainingGrams}
              onChange={(e) => setForm((prev) => ({ ...prev, remainingGrams: e.target.value }))}
              required
            />
          </div>
          <textarea
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <button className="rounded-lg bg-[var(--brand)] px-3 py-2 font-semibold text-white" type="submit">
            Create spool
          </button>
        </form>
      </section>

      <section className="space-y-2">
        {(list ?? []).map((spool: any) => (
          <article key={spool._id} className="rounded-xl border border-zinc-200 bg-white p-3">
            <a href={`/spool/${spool.spoolId}`} className="block text-sm font-semibold hover:underline">
              {spool.material} / {spool.colourName} ({spool.spoolId})
            </a>
            <p className="text-sm text-zinc-600">{spool.brand} • {spool.remainingGrams}g</p>
            {selectedSlotId ? (
              <button
                onClick={() => void assignSpoolToSlot({ spoolId: spool.spoolId, slotId: selectedSlotId as any })}
                className="mt-2 rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white"
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
