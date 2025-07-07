import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
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
  kioskConfig: jsonb("kiosk_config"), // Add kiosk configuration
});

// Device commands table for tracking remote actions
export const deviceCommands = pgTable("device_commands", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  command: text("command").notNull(), // lock, reboot, wipe, refresh_config
  status: text("status").notNull().default("pending"), // pending, sent, completed, failed
  issuedBy: integer("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  response: jsonb("response"),
});

// Chat messages table for the MDM assistant
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
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

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

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
  issuedBy: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  message: true,
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

// Kiosk Config Type
export type KioskConfig = {
  lockedApp: string;
  allowedApps: string[];
  homeScreenUrl?: string;
  autoStartApps: string[];
  disableSettings: boolean;
  disableStatusBar: boolean;
  exitCode?: string;
}