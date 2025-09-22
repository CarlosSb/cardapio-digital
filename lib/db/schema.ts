import { pgTable, text, integer, timestamp, uuid, boolean, jsonb, inet, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// NOTE: Existing tables (users, restaurants, categories, menu_items) are managed via SQL scripts
// Only new analytical tables are managed by Drizzle ORM

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