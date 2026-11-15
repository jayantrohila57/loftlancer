import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

export type ActivityJsonValue =
  | string
  | number
  | boolean
  | null
  | ActivityJsonValue[]
  | { [key: string]: ActivityJsonValue }

export type ActivityValues = Record<string, ActivityJsonValue>

/** A resolver key and safe identifiers, never an executable URL. */
export interface ActivityTarget {
  routeKey: string
  params?: Record<string, string>
  anchor?: string
}

/** ID digests prevent retries from restoring deleted history. */
export const activityEventTombstone = pgTable("activity_event_tombstone", {
  idHash: text("id_hash").primaryKey(),
})

/** Shared storage for every action category. IDs are supplied before execution. */
export const activityEvent = pgTable(
  "activity_event",
  {
    activityId: text("activity_id").primaryKey(),
    actionId: text("action_id").notNull(),
    category: text("category").notNull(),
    schemaVersion: integer("schema_version").notNull().default(1),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorType: text("actor_type", {
      enum: ["user", "system", "integration", "unknown"],
    }).notNull(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    outcome: text("outcome", {
      enum: ["success", "denied", "failed", "error", "unknown"],
    }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sourceApp: text("source_app"),
    sourceModule: text("source_module"),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    beforeValue: jsonb("before_value").$type<ActivityValues>(),
    afterValue: jsonb("after_value").$type<ActivityValues>(),
    metadata: jsonb("metadata").$type<ActivityValues>(),
    target: jsonb("target").$type<ActivityTarget>(),
    correlationId: text("correlation_id"),
    sessionId: text("session_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("activity_event_owner_time_idx").on(
      table.ownerUserId,
      table.occurredAt,
      table.activityId
    ),
    index("activity_event_owner_category_time_idx").on(
      table.ownerUserId,
      table.category,
      table.occurredAt,
      table.activityId
    ),
    index("activity_event_owner_action_time_idx").on(
      table.ownerUserId,
      table.actionId,
      table.occurredAt,
      table.activityId
    ),
    check(
      "activity_event_identity_check",
      sql`length(${table.activityId}) BETWEEN 1 AND 256 AND length(${table.actionId}) BETWEEN 1 AND 160 AND length(${table.category}) BETWEEN 1 AND 80 AND ${table.schemaVersion} > 0`
    ),
    check(
      "activity_event_actor_check",
      sql`${table.actorType} IN ('user', 'system', 'integration', 'unknown') AND (${table.actorUserId} IS NULL OR ${table.actorType} = 'user')`
    ),
    check(
      "activity_event_outcome_check",
      sql`${table.outcome} IN ('success', 'denied', 'failed', 'error', 'unknown')`
    ),
    check(
      "activity_event_values_check",
      sql`(${table.beforeValue} IS NULL OR (jsonb_typeof(${table.beforeValue}) = 'object' AND octet_length(${table.beforeValue}::text) <= 65536)) AND (${table.afterValue} IS NULL OR (jsonb_typeof(${table.afterValue}) = 'object' AND octet_length(${table.afterValue}::text) <= 65536)) AND (${table.metadata} IS NULL OR (jsonb_typeof(${table.metadata}) = 'object' AND octet_length(${table.metadata}::text) <= 65536))`
    ),
    check(
      "activity_event_target_check",
      sql`${table.target} IS NULL OR (jsonb_typeof(${table.target}) = 'object' AND ${table.target} ? 'routeKey' AND jsonb_typeof(${table.target}->'routeKey') = 'string' AND length(${table.target}->>'routeKey') BETWEEN 1 AND 160 AND octet_length(${table.target}::text) <= 4096)`
    ),
  ]
)

/** Account preferences are distinct from each browser's location permission. */
export const userPermission = pgTable("user_permission", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  locationEnabled: boolean("location_enabled").notNull().default(false),
  locationGeneration: integer("location_generation").notNull().default(0),
  locationDecisionAt: timestamp("location_decision_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const userActivity = pgTable(
  "user_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    type: text("type").notNull(),
    outcome: text("outcome").notNull(),
    source: text("source").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata:
      jsonb("metadata").$type<
        Record<string, string | number | boolean | null>
      >(),
  },
  (table) => [
    index("user_activity_user_time_idx").on(table.userId, table.occurredAt),
    index("user_activity_user_type_idx").on(table.userId, table.type),
  ]
)

export const securityActivity = pgTable(
  "security_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    type: text("type").notNull(),
    outcome: text("outcome").notNull(),
    sessionId: text("session_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata:
      jsonb("metadata").$type<
        Record<string, string | number | boolean | null>
      >(),
  },
  (table) => [
    index("security_activity_user_time_idx").on(table.userId, table.occurredAt),
    index("security_activity_user_type_idx").on(table.userId, table.type),
  ]
)

export const activityLocation = pgTable(
  "activity_location",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sessionId: text("session_id"),
    eventId: text("event_id").references(() => securityActivity.id, {
      onDelete: "set null",
    }),
    /** Canonical link; eventId remains until legacy producers migrate. */
    activityId: text("activity_id").references(() => activityEvent.activityId, {
      onDelete: "set null",
    }),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    accuracyMeters: doublePrecision("accuracy_meters").notNull(),
    source: text("source").notNull(),
  },
  (table) => [
    index("activity_location_user_time_idx").on(table.userId, table.capturedAt),
    index("activity_location_activity_idx").on(table.activityId),
  ]
)
