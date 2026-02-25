import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

async function buildDashboard(ctx: any, ownerUserId: string) {
  const printer = await ctx.db
    .query("printers")
    .withIndex("by_owner", (q: any) => q.eq("ownerUserId", ownerUserId))
    .first();

  if (!printer) {
    return {
      printer: null,
      amsUnits: [],
      slots: [],
      assignments: [],
    };
  }

  const amsUnits = await ctx.db
    .query("amsUnits")
    .withIndex("by_printer", (q: any) => q.eq("printerId", printer._id))
    .collect();

  const slots = (
    await Promise.all(
      amsUnits.map((unit: any) =>
        ctx.db
          .query("amsSlots")
          .withIndex("by_ams_unit", (q: any) => q.eq("amsUnitId", unit._id))
          .collect(),
      ),
    )
  ).flat();

  const assignments = await ctx.db
    .query("slotAssignments")
    .withIndex("by_owner", (q: any) => q.eq("ownerUserId", ownerUserId))
    .collect();

  const spoolIds = assignments.map((assignment: any) => assignment.spoolDocId);
  const spools = await Promise.all(spoolIds.map((id: any) => ctx.db.get(id)));
  const spoolById = new Map(spools.filter(Boolean).map((spool: any) => [spool._id, spool]));

  return {
    printer,
    amsUnits: amsUnits.sort((a: any, b: any) => a.index - b.index),
    slots: slots.sort((a: any, b: any) => {
      if (a.amsUnitId === b.amsUnitId) return a.slotNumber - b.slotNumber;
      return String(a.amsUnitId).localeCompare(String(b.amsUnitId));
    }),
    assignments: assignments.map((assignment: any) => {
      const spool = spoolById.get(assignment.spoolDocId);
      return {
        ...assignment,
        spool: spool
          ? {
              _id: spool._id,
              spoolId: spool.spoolId,
              material: spool.material,
              colourName: spool.colourName,
              brand: spool.brand,
              remainingGrams: spool.remainingGrams,
            }
          : null,
      };
    }),
  };
}

export const getOrCreateDefaultPrinter = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    let printer = await ctx.db
      .query("printers")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .first();

    if (!printer) {
      const now = Date.now();
      const printerId = await ctx.db.insert("printers", {
        ownerUserId,
        name: "Printer v1",
        createdAt: now,
      });

      const amsUnitId = await ctx.db.insert("amsUnits", {
        ownerUserId,
        printerId,
        index: 1,
        createdAt: now,
      });

      for (let slotNumber = 1; slotNumber <= 4; slotNumber += 1) {
        await ctx.db.insert("amsSlots", {
          ownerUserId,
          amsUnitId,
          slotNumber,
          createdAt: now,
        });
      }

      printer = await ctx.db.get(printerId);
      if (!printer) {
        throw new Error("Failed to create default printer");
      }
    }

    return buildDashboard(ctx, ownerUserId);
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return buildDashboard(ctx, identity.subject);
  },
});

export const addAmsUnit = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const printer = await ctx.db
      .query("printers")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .first();

    if (!printer) {
      throw new Error("No printer found. Open dashboard first.");
    }

    const units = await ctx.db
      .query("amsUnits")
      .withIndex("by_printer", (q) => q.eq("printerId", printer._id))
      .collect();

    const nextIndex = units.length + 1;
    const now = Date.now();

    const amsUnitId = await ctx.db.insert("amsUnits", {
      ownerUserId,
      printerId: printer._id,
      index: nextIndex,
      createdAt: now,
    });

    for (let slotNumber = 1; slotNumber <= 4; slotNumber += 1) {
      await ctx.db.insert("amsSlots", {
        ownerUserId,
        amsUnitId,
        slotNumber,
        createdAt: now,
      });
    }

    return { amsUnitId, index: nextIndex };
  },
});

export const deleteAmsUnit = mutation({
  args: {
    amsUnitId: v.id("amsUnits"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const ownerUserId = identity.subject;

    const amsUnit = await ctx.db.get(args.amsUnitId);
    if (!amsUnit || amsUnit.ownerUserId !== ownerUserId) {
      throw new Error("AMS unit not found");
    }

    const slots = await ctx.db
      .query("amsSlots")
      .withIndex("by_ams_unit", (q) => q.eq("amsUnitId", args.amsUnitId))
      .collect();

    for (const slot of slots) {
      const assignment = await ctx.db
        .query("slotAssignments")
        .withIndex("by_owner_slot", (q) =>
          q.eq("ownerUserId", ownerUserId).eq("slotId", slot._id),
        )
        .first();
      if (assignment) {
        await ctx.db.delete(assignment._id);
      }
      await ctx.db.delete(slot._id);
    }

    await ctx.db.delete(args.amsUnitId);
    return { ok: true };
  },
});
