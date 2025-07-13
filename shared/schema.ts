import { pgTable, text, varchar, serial, integer, boolean, timestamp, jsonb, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Devices table for MDM device management
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imei: text("imei").unique(),
  serialNumber: text("serial_number").unique(),
  deviceType: text("device_type").notNull(), // android, ios, windows
  status: text("status").notNull().default("offline"), // online, offline, warning
  batteryLevel: integer("battery_level").default(0),
  lastSeen: timestamp("last_seen").defaultNow(),
  location: text("location"),
  osVersion: text("os_version"),
  appVersion: text("app_version"),
  fcmToken: text("fcm_token"),
  isKioskMode: boolean("is_kiosk_mode").default(false),
  kioskAppPackage: text("kiosk_app_package"),
  policies: jsonb("policies"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  kioskConfig: jsonb("kiosk_config").default({}), // Add kiosk configuration
});

// Device commands table for tracking remote actions
export const deviceCommands = pgTable("device_commands", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  command: text("command").notNull(), // lock, reboot, wipe, refresh_config
  status: text("status").notNull().default("pending"), // pending, sent, completed, failed
  issuedBy: varchar("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  response: jsonb("response"),
});

// Chat messages table for the MDM assistant
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Device logs table for audit trail
export const deviceLogs = pgTable("device_logs", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Geofences table for location-based zones
export const geofences = pgTable("geofences", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius").notNull(), // in meters
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location policies table for geofence-based rules
export const locationPolicies = pgTable("location_policies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  geofenceId: integer("geofence_id").notNull().references(() => geofences.id),
  policyType: varchar("policy_type", { length: 50 }).notNull(), // 'allow', 'restrict', 'notify'
  actions: jsonb("actions").notNull(), // actions to take when policy is triggered
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device location history for tracking
export const deviceLocationHistory = pgTable("device_location_history", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  accuracy: real("accuracy"), // GPS accuracy in meters
  timestamp: timestamp("timestamp").defaultNow(),
  geofenceId: integer("geofence_id").references(() => geofences.id),
  policyViolation: boolean("policy_violation").default(false),
});

// Geofence alerts for policy violations
export const geofenceAlerts = pgTable("geofence_alerts", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id),
  geofenceId: integer("geofence_id").notNull().references(() => geofences.id),
  policyId: integer("policy_id").notNull().references(() => locationPolicies.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'entry', 'exit', 'violation'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export type UpsertUser = typeof users.$inferInsert;

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  imei: true,
  serialNumber: true,
  deviceType: true,
  fcmToken: true,
  isKioskMode: true,
  kioskAppPackage: true,
  kioskConfig: true,
});

export const insertDeviceCommandSchema = createInsertSchema(deviceCommands).pick({
  deviceId: true,
  command: true,
  status: true,
  issuedBy: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  message: true,
});

export const insertGeofenceSchema = createInsertSchema(geofences).pick({
  name: true,
  description: true,
  latitude: true,
  longitude: true,
  radius: true,
  isActive: true,
});

export const insertLocationPolicySchema = createInsertSchema(locationPolicies).pick({
  name: true,
  description: true,
  geofenceId: true,
  policyType: true,
  actions: true,
  isActive: true,
});

export const insertDeviceLocationHistorySchema = createInsertSchema(deviceLocationHistory).pick({
  deviceId: true,
  latitude: true,
  longitude: true,
  accuracy: true,
  geofenceId: true,
  policyViolation: true,
});

export const insertGeofenceAlertSchema = createInsertSchema(geofenceAlerts).pick({
  deviceId: true,
  geofenceId: true,
  policyId: true,
  alertType: true,
  message: true,
  isRead: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type DeviceCommand = typeof deviceCommands.$inferSelect;
export type InsertDeviceCommand = z.infer<typeof insertDeviceCommandSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type DeviceLog = typeof deviceLogs.$inferSelect;
export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
export type LocationPolicy = typeof locationPolicies.$inferSelect;
export type InsertLocationPolicy = z.infer<typeof insertLocationPolicySchema>;
export type DeviceLocationHistory = typeof deviceLocationHistory.$inferSelect;
export type InsertDeviceLocationHistory = z.infer<typeof insertDeviceLocationHistorySchema>;
export type GeofenceAlert = typeof geofenceAlerts.$inferSelect;
export type InsertGeofenceAlert = z.infer<typeof insertGeofenceAlertSchema>;

// Kiosk Config Type
export type KioskConfig = {
  lockedApp: string;
  allowedApps: string[];
  homeScreenUrl?: string;
  autoStartApps: string[];
  disableSettings: boolean;
  disableStatusBar: boolean;
  exitCode?: string;
};

// Location Policy Actions Type
export type LocationPolicyActions = {
  lockDevice?: boolean;
  sendAlert?: boolean;
  notifyAdmin?: boolean;
  restrictApps?: string[];
  enableKiosk?: boolean;
  logLocation?: boolean;
  requireWifi?: boolean;
  disableCamera?: boolean;
};