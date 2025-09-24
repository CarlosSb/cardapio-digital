import { pgTable, text, integer, timestamp, uuid, boolean, jsonb, inet, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// NOTE: Existing tables (users, restaurants, categories, menu_items) are managed via SQL scripts
// Only new analytical and billing tables are managed by Drizzle ORM

// Existing tables with moderation fields added
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  rawJson: jsonb("raw_json"),
  // Moderation fields
  isBlocked: boolean("is_blocked").default(false),
  blockedAt: timestamp("blocked_at", { withTimezone: true }),
  blockedBy: uuid("blocked_by"),
  blockedReason: text("blocked_reason"),
  isBanned: boolean("is_banned").default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  bannedBy: uuid("banned_by"),
  bannedReason: text("banned_reason"),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  blockedIdx: index("users_is_blocked_idx").on(table.isBlocked),
  bannedIdx: index("users_is_banned_idx").on(table.isBanned),
}))

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  ownerEmail: text("owner_email").notNull(),
  logoUrl: text("logo_url"),
  menuDisplayMode: text("menu_display_mode").default("grid").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  // Moderation fields
  isBlocked: boolean("is_blocked").default(false),
  blockedAt: timestamp("blocked_at", { withTimezone: true }),
  blockedBy: uuid("blocked_by"),
  blockedReason: text("blocked_reason"),
  isBanned: boolean("is_banned").default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  bannedBy: uuid("banned_by"),
  bannedReason: text("banned_reason"),
}, (table) => ({
  slugIdx: index("restaurants_slug_idx").on(table.slug),
  ownerEmailIdx: index("restaurants_owner_email_idx").on(table.ownerEmail),
  blockedIdx: index("restaurants_is_blocked_idx").on(table.isBlocked),
  bannedIdx: index("restaurants_is_banned_idx").on(table.isBanned),
}))

// Plans table - NEW TABLE
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").default("BRL").notNull(),
  interval: text("interval").default("month").notNull(),
  features: jsonb("features").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("plans_slug_idx").on(table.slug),
  activeIdx: index("plans_active_idx").on(table.isActive),
}))

// Subscriptions table - NEW TABLE
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull(), // FK to restaurants (no constraint for compatibility)
  planId: uuid("plan_id").notNull(), // FK to plans (no constraint for compatibility)
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  restaurantIdx: index("subscriptions_restaurant_id_idx").on(table.restaurantId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
}))

// Payments table - NEW TABLE
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id"), // FK to subscriptions (nullable)
  restaurantId: uuid("restaurant_id").notNull(), // FK to restaurants (no constraint)
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("BRL").notNull(),
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method"),
  description: text("description"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  subscriptionIdx: index("payments_subscription_id_idx").on(table.subscriptionId),
  restaurantIdx: index("payments_restaurant_id_idx").on(table.restaurantId),
  statusIdx: index("payments_status_idx").on(table.status),
}))

// Usage metrics table - NEW TABLE
export const usageMetrics = pgTable("usage_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull(), // FK to restaurants (no constraint)
  metricKey: text("metric_key").notNull(),
  metricValue: integer("metric_value").default(0).notNull(),
  periodStart: timestamp("period_start", { withTimezone: false }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: false }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  restaurantIdx: index("usage_metrics_restaurant_id_idx").on(table.restaurantId),
  periodIdx: index("usage_metrics_period_idx").on(table.periodStart, table.periodEnd),
}))

// Platform users table (admin users) - NEW TABLE
export const platformUsers = pgTable("platform_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
}, (table) => ({
  emailIdx: index("platform_users_email_idx").on(table.email),
}))

// Analytics events table - NEW TABLE
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data"),
  userId: uuid("user_id"), // No foreign key constraint to avoid issues with existing tables
  restaurantId: uuid("restaurant_id"), // No foreign key constraint to avoid issues with existing tables
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("analytics_events_event_type_idx").on(table.eventType),
  createdAtIdx: index("analytics_events_created_at_idx").on(table.createdAt),
}))

// Menu views table - NEW TABLE
export const menuViews = pgTable("menu_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull(), // No foreign key constraint to avoid issues with existing tables
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: text("device_type"),
  browser: text("browser"),
}, (table) => ({
  restaurantIdIdx: index("menu_views_restaurant_id_idx").on(table.restaurantId),
  viewedAtIdx: index("menu_views_viewed_at_idx").on(table.viewedAt),
}))

// Platform metrics table - NEW TABLE
export const platformMetrics = pgTable("platform_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricKey: text("metric_key").notNull().unique(),
  metricValue: jsonb("metric_value"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
}, (table) => ({
  metricKeyIdx: index("platform_metrics_key_idx").on(table.metricKey),
}))

// Audit logs table - NEW TABLE
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  performedBy: uuid("performed_by").notNull(),
  performedAt: timestamp("performed_at", { withTimezone: true }).defaultNow().notNull(),
  details: jsonb("details"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
}, (table) => ({
  entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  performedByIdx: index("audit_logs_performed_by_idx").on(table.performedBy),
  performedAtIdx: index("audit_logs_performed_at_idx").on(table.performedAt),
}))

// Relations (only for new tables)
export const platformUsersRelations = relations(platformUsers, ({}) => ({
  // No relations for now
}))

export const analyticsEventsRelations = relations(analyticsEvents, ({}) => ({
  // No relations to avoid foreign key issues
}))

export const menuViewsRelations = relations(menuViews, ({}) => ({
  // No relations to avoid foreign key issues
}))

// Types for new tables only
export type PlatformUser = typeof platformUsers.$inferSelect
export type NewPlatformUser = typeof platformUsers.$inferInsert

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert

export type MenuView = typeof menuViews.$inferSelect
export type NewMenuView = typeof menuViews.$inferInsert

export type PlatformMetric = typeof platformMetrics.$inferSelect
export type NewPlatformMetric = typeof platformMetrics.$inferInsert

export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

export type UsageMetric = typeof usageMetrics.$inferSelect
export type NewUsageMetric = typeof usageMetrics.$inferInsert

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert