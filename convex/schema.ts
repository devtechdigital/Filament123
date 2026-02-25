import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  printers: defineTable({
    ownerUserId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  amsUnits: defineTable({
    ownerUserId: v.string(),
    printerId: v.id("printers"),
    index: v.number(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_printer", ["printerId"])
    .index("by_owner_index", ["ownerUserId", "index"]),

  amsSlots: defineTable({
    ownerUserId: v.string(),
    amsUnitId: v.id("amsUnits"),
    slotNumber: v.number(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_ams_unit", ["amsUnitId"])
    .index("by_ams_slot", ["amsUnitId", "slotNumber"]),

  spools: defineTable({
    ownerUserId: v.string(),
    spoolId: v.string(),
    material: v.string(),
    colourName: v.string(),
    brand: v.string(),
    remainingGrams: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_owner_spool_id", ["ownerUserId", "spoolId"]),

  slotAssignments: defineTable({
    ownerUserId: v.string(),
    slotId: v.id("amsSlots"),
    spoolDocId: v.id("spools"),
    assignedAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_owner_slot", ["ownerUserId", "slotId"])
    .index("by_owner_spool", ["ownerUserId", "spoolDocId"]),
});
