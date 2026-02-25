import { v } from "convex/values";
import { ulid } from "ulid";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

export const listUsedMaterials = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const spools = await ctx.db
      .query("spools")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .collect();

    const used = new Set<string>();
    for (const spool of spools) {
      if (spool.material?.trim()) used.add(spool.material.trim());
    }
    return [...used];
  },
});

export const listSpools = query({
  args: {
    searchText: v.optional(v.string()),
    material: v.optional(v.string()),
    brand: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    let spools = await ctx.db
      .query("spools")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .collect();

    if (args.searchText?.trim()) {
      const search = args.searchText.trim().toLowerCase();
      spools = spools.filter((spool) =>
        [spool.spoolId, spool.material, spool.colourName, spool.brand, spool.notes]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search)),
      );
    }

    if (args.material?.trim()) {
      const material = args.material.trim().toLowerCase();
      spools = spools.filter((spool) => spool.material.toLowerCase() === material);
    }

    if (args.brand?.trim()) {
      const brand = args.brand.trim().toLowerCase();
      spools = spools.filter((spool) => spool.brand.toLowerCase() === brand);
    }

    return spools.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getSpoolBySpoolId = query({
  args: {
    spoolId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const spool = await ctx.db
      .query("spools")
      .withIndex("by_owner_spool_id", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("spoolId", args.spoolId),
      )
      .first();

    if (!spool) {
      return { spool: null, location: null };
    }

    const assignment = await ctx.db
      .query("slotAssignments")
      .withIndex("by_owner_spool", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("spoolDocId", spool._id),
      )
      .first();

    if (!assignment) {
      return { spool, location: null };
    }

    const slot = await ctx.db.get(assignment.slotId);
    if (!slot) {
      return { spool, location: null };
    }

    const amsUnit = await ctx.db.get(slot.amsUnitId);

    return {
      spool,
      location: {
        assignmentId: assignment._id,
        slotId: slot._id,
        slotNumber: slot.slotNumber,
        amsUnitIndex: amsUnit?.index ?? null,
      },
    };
  },
});

export const createSpool = mutation({
  args: {
    material: v.string(),
    colourName: v.string(),
    brand: v.string(),
    remainingGrams: v.number(),
    notes: v.optional(v.string()),
    price: v.optional(v.number()),
    datePurchased: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;
    const now = Date.now();

    let spoolId = ulid();
    while (
      await ctx.db
        .query("spools")
        .withIndex("by_owner_spool_id", (q) =>
          q.eq("ownerUserId", ownerUserId).eq("spoolId", spoolId),
        )
        .first()
    ) {
      spoolId = ulid();
    }

    await ctx.db.insert("spools", {
      ownerUserId,
      spoolId,
      material: args.material,
      colourName: args.colourName,
      brand: args.brand,
      remainingGrams: args.remainingGrams,
      notes: args.notes,
      price: args.price,
      datePurchased: args.datePurchased,
      createdAt: now,
      updatedAt: now,
    });

    return { spoolId };
  },
});

export const updateSpool = mutation({
  args: {
    spoolId: v.string(),
    patch: v.object({
      material: v.optional(v.string()),
      colourName: v.optional(v.string()),
      brand: v.optional(v.string()),
      remainingGrams: v.optional(v.number()),
      notes: v.optional(v.string()),
      price: v.optional(v.number()),
      datePurchased: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const spool = await ctx.db
      .query("spools")
      .withIndex("by_owner_spool_id", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("spoolId", args.spoolId),
      )
      .first();

    if (!spool) {
      throw new Error("Spool not found");
    }

    await ctx.db.patch(spool._id, {
      ...args.patch,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const assignSpoolToSlot = mutation({
  args: {
    spoolId: v.string(),
    slotId: v.id("amsSlots"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const spool = await ctx.db
      .query("spools")
      .withIndex("by_owner_spool_id", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("spoolId", args.spoolId),
      )
      .first();

    if (!spool) {
      throw new Error("Spool not found");
    }

    const slot = await ctx.db.get(args.slotId);
    if (!slot || slot.ownerUserId !== ownerUserId) {
      throw new Error("Slot not found");
    }

    const existingSpoolAssignment = await ctx.db
      .query("slotAssignments")
      .withIndex("by_owner_spool", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("spoolDocId", spool._id),
      )
      .first();

    if (existingSpoolAssignment) {
      await ctx.db.delete(existingSpoolAssignment._id);
    }

    const existingSlotAssignment = await ctx.db
      .query("slotAssignments")
      .withIndex("by_owner_slot", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("slotId", args.slotId),
      )
      .first();

    if (existingSlotAssignment) {
      await ctx.db.delete(existingSlotAssignment._id);
    }

    await ctx.db.insert("slotAssignments", {
      ownerUserId,
      slotId: args.slotId,
      spoolDocId: spool._id,
      assignedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const unloadSlot = mutation({
  args: {
    slotId: v.id("amsSlots"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const slot = await ctx.db.get(args.slotId);
    if (!slot || slot.ownerUserId !== ownerUserId) {
      throw new Error("Slot not found");
    }

    const existingSlotAssignment = await ctx.db
      .query("slotAssignments")
      .withIndex("by_owner_slot", (q) =>
        q.eq("ownerUserId", ownerUserId).eq("slotId", args.slotId),
      )
      .first();

    if (existingSlotAssignment) {
      await ctx.db.delete(existingSlotAssignment._id);
    }

    return { ok: true };
  },
});

export const listAssignableSlots = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const slots = await ctx.db
      .query("amsSlots")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .collect();

    const units = await ctx.db
      .query("amsUnits")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .collect();

    const unitMap = new Map(units.map((unit) => [unit._id, unit]));

    return slots
      .map((slot) => ({
        slotId: slot._id,
        slotNumber: slot.slotNumber,
        amsUnitIndex: unitMap.get(slot.amsUnitId)?.index ?? -1,
      }))
      .sort((a, b) => {
        if (a.amsUnitIndex === b.amsUnitIndex) return a.slotNumber - b.slotNumber;
        return a.amsUnitIndex - b.amsUnitIndex;
      });
  },
});
