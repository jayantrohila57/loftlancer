import { relations } from "drizzle-orm"
import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { organization } from "./organization.schema"

/** Idempotent Autumn / billing webhook processing journal. */
export const billingWebhookEvent = pgTable(
  "billing_webhook_event",
  {
    eventId: text("event_id").primaryKey(),
    eventType: text("event_type").notNull(),
    customerId: text("customer_id"),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    payloadHash: text("payload_hash").notNull(),
    status: text("status", {
      enum: ["received", "processed", "failed", "ignored"],
    })
      .notNull()
      .default("received"),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => [
    index("billing_webhook_event_org_id_idx").on(table.organizationId),
    index("billing_webhook_event_customer_id_idx").on(table.customerId),
    index("billing_webhook_event_status_idx").on(table.status),
  ]
)

/** AI credit hold → settle / release ledger (v1 — no invoke routes yet). */
export const aiCreditLedger = pgTable(
  "ai_credit_ledger",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    state: text("state", {
      enum: ["held", "settled", "released", "unknown"],
    })
      .notNull()
      .default("held"),
    amount: integer("amount").notNull().default(1),
    heldAt: timestamp("held_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    settledAt: timestamp("settled_at"),
    releasedAt: timestamp("released_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("ai_credit_ledger_org_idempotency_uidx").on(
      table.organizationId,
      table.idempotencyKey
    ),
    index("ai_credit_ledger_org_state_idx").on(
      table.organizationId,
      table.state
    ),
    index("ai_credit_ledger_expires_at_idx").on(table.expiresAt),
  ]
)

/** Optional outbox for async Autumn `track` calls (future slice). */
export const autumnTrackOutbox = pgTable(
  "autumn_track_outbox",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    featureId: text("feature_id").notNull(),
    value: bigint("value", { mode: "number" }).notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status", {
      enum: ["pending", "sent", "dead_letter"],
    })
      .notNull()
      .default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("autumn_track_outbox_idempotency_uidx").on(
      table.organizationId,
      table.idempotencyKey
    ),
    index("autumn_track_outbox_status_idx").on(table.status),
  ]
)

export const billingWebhookEventRelations = relations(
  billingWebhookEvent,
  ({ one }) => ({
    organization: one(organization, {
      fields: [billingWebhookEvent.organizationId],
      references: [organization.id],
    }),
  })
)

export const aiCreditLedgerRelations = relations(aiCreditLedger, ({ one }) => ({
  organization: one(organization, {
    fields: [aiCreditLedger.organizationId],
    references: [organization.id],
  }),
}))

export const autumnTrackOutboxRelations = relations(
  autumnTrackOutbox,
  ({ one }) => ({
    organization: one(organization, {
      fields: [autumnTrackOutbox.organizationId],
      references: [organization.id],
    }),
  })
)
