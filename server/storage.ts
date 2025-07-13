import { 
  users, 
  devices, 
  deviceCommands, 
  chatMessages, 
  deviceLogs,
  geofences,
  locationPolicies,
  deviceLocationHistory,
  geofenceAlerts,
  type User, 
  type UpsertUser,
  type Device,
  type InsertDevice,
  type DeviceCommand,
  type InsertDeviceCommand,
  type ChatMessage,
  type InsertChatMessage,
  type DeviceLog,
  type Geofence,
  type LocationPolicy,
  type DeviceLocationHistory,
  type GeofenceAlert,
  type InsertGeofence,
  type InsertLocationPolicy,
  type InsertDeviceLocationHistory,
  type InsertGeofenceAlert,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByImei(imei: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: Partial<Device>): Promise<Device>;
  deleteDevice(id: number): Promise<void>;

  // Device command operations
  createDeviceCommand(command: InsertDeviceCommand): Promise<DeviceCommand>;
  getDeviceCommands(deviceId: number): Promise<DeviceCommand[]>;
  updateDeviceCommand(id: number, updates: Partial<DeviceCommand>): Promise<DeviceCommand>;

  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: number): Promise<ChatMessage[]>;

  // Device logs
  createDeviceLog(log: { deviceId: number; action: string; details?: any }): Promise<DeviceLog>;
  getDeviceLogs(deviceId: number): Promise<DeviceLog[]>;

  // Geofencing operations
  getGeofences(): Promise<Geofence[]>;
  getGeofence(id: number): Promise<Geofence | undefined>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  updateGeofence(id: number, updates: Partial<Geofence>): Promise<Geofence>;
  deleteGeofence(id: number): Promise<void>;

  // Location policy operations
  getLocationPolicies(): Promise<LocationPolicy[]>;
  getLocationPolicy(id: number): Promise<LocationPolicy | undefined>;
  createLocationPolicy(policy: InsertLocationPolicy): Promise<LocationPolicy>;
  updateLocationPolicy(id: number, updates: Partial<LocationPolicy>): Promise<LocationPolicy>;
  deleteLocationPolicy(id: number): Promise<void>;

  // Device location history
  createDeviceLocationHistory(history: InsertDeviceLocationHistory): Promise<DeviceLocationHistory>;
  getDeviceLocationHistory(deviceId: number): Promise<DeviceLocationHistory[]>;

  // Geofence alerts
  getGeofenceAlerts(): Promise<GeofenceAlert[]>;
  createGeofenceAlert(alert: InsertGeofenceAlert): Promise<GeofenceAlert>;
  markAlertAsRead(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private devices: Map<number, Device> = new Map();
  private deviceCommands: Map<number, DeviceCommand> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private deviceLogs: Map<number, DeviceLog> = new Map();

  private currentDeviceId = 1;
  private currentCommandId = 1;
  private currentChatId = 1;
  private currentLogId = 1;

  constructor() {
    // Initialize with demo devices
    this.initializeDemoDevices();
  }

  private initializeDemoDevices() {
    const now = new Date();
    const devices = [
      {
        name: "Samsung Galaxy Tab A8",
        imei: "352033111234567",
        serialNumber: null,
        deviceType: "android",
        status: "online",
        batteryLevel: 85,
        lastSeen: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
        location: "New York, NY",
        osVersion: "Android 13",
        appVersion: "1.0.0",
        fcmToken: "fcm_token_1",
        isKioskMode: true,
        kioskAppPackage: "com.fortress.kiosk",
        policies: { wifi: true, bluetooth: false, camera: false },
        enrolledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        name: "iPad Pro 11-inch",
        imei: null,
        serialNumber: "DLXKXXXXX",
        deviceType: "ios",
        status: "offline",
        batteryLevel: 15,
        lastSeen: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        location: "San Francisco, CA",
        osVersion: "iOS 17.1",
        appVersion: "1.0.0",
        fcmToken: "fcm_token_2",
        isKioskMode: false,
        kioskAppPackage: null,
        policies: { wifi: true, bluetooth: true, camera: true },
        enrolledAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        name: "Google Pixel 7",
        imei: "352033111234568",
        serialNumber: null,
        deviceType: "android",
        status: "warning",
        batteryLevel: 42,
        lastSeen: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        location: "Chicago, IL",
        osVersion: "Android 14",
        appVersion: "1.0.0",
        fcmToken: "fcm_token_3",
        isKioskMode: true,
        kioskAppPackage: "com.fortress.kiosk",
        policies: { wifi: true, bluetooth: false, camera: false },
        enrolledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(now.getTime() - 15 * 60 * 1000),
      }
    ];

    devices.forEach(device => {
      const id = this.currentDeviceId++;
      const deviceWithId = { ...device, id } as Device;
      this.devices.set(id, deviceWithId);
    });
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Device operations
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByImei(imei: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(device => device.imei === imei);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = {
      id,
      name: insertDevice.name,
      imei: insertDevice.imei || null,
      serialNumber: insertDevice.serialNumber || null,
      deviceType: insertDevice.deviceType,
      status: "offline",
      batteryLevel: 0,
      lastSeen: new Date(),
      location: null,
      osVersion: null,
      appVersion: null,
      fcmToken: null,
      isKioskMode: false,
      kioskAppPackage: null,
      policies: null,
      enrolledAt: new Date(),
      updatedAt: new Date(),
      kioskConfig: {},
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device> {
    const device = this.devices.get(id);
    if (!device) {
      throw new Error("Device not found");
    }
    const updatedDevice = { ...device, ...updates, updatedAt: new Date() };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<void> {
    this.devices.delete(id);
  }

  // Device command operations
  async createDeviceCommand(insertCommand: InsertDeviceCommand): Promise<DeviceCommand> {
    const id = this.currentCommandId++;
    const command: DeviceCommand = {
      id,
      deviceId: insertCommand.deviceId || null,
      command: insertCommand.command,
      issuedBy: insertCommand.issuedBy || null,
      status: "pending",
      issuedAt: new Date(),
      completedAt: null,
      response: null,
    };
    this.deviceCommands.set(id, command);
    return command;
  }

  async getDeviceCommands(deviceId: number): Promise<DeviceCommand[]> {
    return Array.from(this.deviceCommands.values()).filter(cmd => cmd.deviceId === deviceId);
  }

  async updateDeviceCommand(id: number, updates: Partial<DeviceCommand>): Promise<DeviceCommand> {
    const command = this.deviceCommands.get(id);
    if (!command) {
      throw new Error("Device command not found");
    }
    const updatedCommand = { ...command, ...updates };
    this.deviceCommands.set(id, updatedCommand);
    return updatedCommand;
  }

  // Chat operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      id,
      userId: insertMessage.userId || null,
      message: insertMessage.message,
      response: null,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(msg => msg.userId === userId);
  }

  // Device logs
  async createDeviceLog(log: { deviceId: number; action: string; details?: any }): Promise<DeviceLog> {
    const id = this.currentLogId++;
    const deviceLog: DeviceLog = {
      id,
      deviceId: log.deviceId,
      action: log.action,
      details: log.details || null,
      timestamp: new Date(),
    };
    this.deviceLogs.set(id, deviceLog);
    return deviceLog;
  }

  async getDeviceLogs(deviceId: number): Promise<DeviceLog[]> {
    return Array.from(this.deviceLogs.values()).filter(log => log.deviceId === deviceId);
  }

  // Geofencing operations
  private geofences: Map<number, Geofence> = new Map();
  private locationPolicies: Map<number, LocationPolicy> = new Map();
  private deviceLocationHistory: Map<number, DeviceLocationHistory> = new Map();
  private geofenceAlerts: Map<number, GeofenceAlert> = new Map();
  private currentGeofenceId = 1;
  private currentLocationPolicyId = 1;
  private currentLocationHistoryId = 1;
  private currentGeofenceAlertId = 1;

  async getGeofences(): Promise<Geofence[]> {
    return Array.from(this.geofences.values());
  }

  async getGeofence(id: number): Promise<Geofence | undefined> {
    return this.geofences.get(id);
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const id = this.currentGeofenceId++;
    const geofence: Geofence = {
      id,
      ...insertGeofence,
      description: insertGeofence.description ?? null,
      isActive: insertGeofence.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.geofences.set(id, geofence);
    return geofence;
  }

  async updateGeofence(id: number, updates: Partial<Geofence>): Promise<Geofence> {
    const geofence = this.geofences.get(id);
    if (!geofence) throw new Error('Geofence not found');

    const updated = { ...geofence, ...updates, updatedAt: new Date() };
    this.geofences.set(id, updated);
    return updated;
  }

  async deleteGeofence(id: number): Promise<void> {
    this.geofences.delete(id);
  }

  async getLocationPolicies(): Promise<LocationPolicy[]> {
    return Array.from(this.locationPolicies.values());
  }

  async getLocationPolicy(id: number): Promise<LocationPolicy | undefined> {
    return this.locationPolicies.get(id);
  }

  async createLocationPolicy(insertPolicy: InsertLocationPolicy): Promise<LocationPolicy> {
    const id = this.currentLocationPolicyId++;
    const policy: LocationPolicy = {
      id,
      ...insertPolicy,
      description: insertPolicy.description ?? null,
      isActive: insertPolicy.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.locationPolicies.set(id, policy);
    return policy;
  }

  async updateLocationPolicy(id: number, updates: Partial<LocationPolicy>): Promise<LocationPolicy> {
    const policy = this.locationPolicies.get(id);
    if (!policy) throw new Error('Location policy not found');

    const updated = { ...policy, ...updates, updatedAt: new Date() };
    this.locationPolicies.set(id, updated);
    return updated;
  }

  async deleteLocationPolicy(id: number): Promise<void> {
    this.locationPolicies.delete(id);
  }

  async createDeviceLocationHistory(insertHistory: InsertDeviceLocationHistory): Promise<DeviceLocationHistory> {
    const id = this.currentLocationHistoryId++;
    const history: DeviceLocationHistory = {
      id,
      ...insertHistory,
      geofenceId: insertHistory.geofenceId ?? null,
      accuracy: insertHistory.accuracy ?? null,
      policyViolation: insertHistory.policyViolation ?? null,
      timestamp: new Date(),
    };
    this.deviceLocationHistory.set(id, history);
    return history;
  }

  async getDeviceLocationHistory(deviceId: number): Promise<DeviceLocationHistory[]> {
    return Array.from(this.deviceLocationHistory.values()).filter(h => h.deviceId === deviceId);
  }

  async getGeofenceAlerts(): Promise<GeofenceAlert[]> {
    return Array.from(this.geofenceAlerts.values());
  }

  async createGeofenceAlert(insertAlert: InsertGeofenceAlert): Promise<GeofenceAlert> {
    const id = this.currentGeofenceAlertId++;
    const alert: GeofenceAlert = {
      id,
      ...insertAlert,
      isRead: insertAlert.isRead ?? null,
      timestamp: new Date(),
    };
    this.geofenceAlerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<void> {
    const alert = this.geofenceAlerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.geofenceAlerts.set(id, alert);
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error: any) {
      // If there's a unique constraint violation on email, try to find existing user
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        const existingUser = await this.getUser(userData.id);
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getDeviceByImei(imei: string): Promise<Device | undefined> {
    if (!imei || imei.length !== 15) {
      throw new Error('Invalid IMEI format');
    }
    const [device] = await db.select().from(devices).where(eq(devices.imei, imei));
    return device;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db.insert(devices).values(insertDevice).returning();
    return device;
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device> {
    const [device] = await db.update(devices).set(updates).where(eq(devices.id, id)).returning();
    return device;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async createDeviceCommand(insertCommand: InsertDeviceCommand): Promise<DeviceCommand> {
    const [command] = await db.insert(deviceCommands).values(insertCommand).returning();
    return command;
  }

  async getDeviceCommands(deviceId: number): Promise<DeviceCommand[]> {
    return await db.select().from(deviceCommands).where(eq(deviceCommands.deviceId, deviceId));
  }

  async updateDeviceCommand(id: number, updates: Partial<DeviceCommand>): Promise<DeviceCommand> {
    const [command] = await db.update(deviceCommands).set(updates).where(eq(deviceCommands.id, id)).returning();
    return command;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }

  async createDeviceLog(log: { deviceId: number; action: string; details?: any }): Promise<DeviceLog> {
    const [deviceLog] = await db.insert(deviceLogs).values(log).returning();
    return deviceLog;
  }

  async getDeviceLogs(deviceId: number): Promise<DeviceLog[]> {
    return await db.select().from(deviceLogs).where(eq(deviceLogs.deviceId, deviceId));
  }

  async getGeofences(): Promise<Geofence[]> {
    return await db.select().from(geofences);
  }

  async getGeofence(id: number): Promise<Geofence | undefined> {
    const [geofence] = await db.select().from(geofences).where(eq(geofences.id, id));
    return geofence;
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const [geofence] = await db.insert(geofences).values(insertGeofence).returning();
    return geofence;
  }

  async updateGeofence(id: number, updates: Partial<Geofence>): Promise<Geofence> {
    const [geofence] = await db.update(geofences).set(updates).where(eq(geofences.id, id)).returning();
    return geofence;
  }

  async deleteGeofence(id: number): Promise<void> {
    await db.delete(geofences).where(eq(geofences.id, id));
  }

  async getLocationPolicies(): Promise<LocationPolicy[]> {
    return await db.select().from(locationPolicies);
  }

  async getLocationPolicy(id: number): Promise<LocationPolicy | undefined> {
    const [policy] = await db.select().from(locationPolicies).where(eq(locationPolicies.id, id));
    return policy;
  }

  async createLocationPolicy(insertPolicy: InsertLocationPolicy): Promise<LocationPolicy> {
    const [policy] = await db.insert(locationPolicies).values(insertPolicy).returning();
    return policy;
  }

  async updateLocationPolicy(id: number, updates: Partial<LocationPolicy>): Promise<LocationPolicy> {
    const [policy] = await db.update(locationPolicies).set(updates).where(eq(locationPolicies.id, id)).returning();
    return policy;
  }

  async deleteLocationPolicy(id: number): Promise<void> {
    await db.delete(locationPolicies).where(eq(locationPolicies.id, id));
  }

  async createDeviceLocationHistory(insertHistory: InsertDeviceLocationHistory): Promise<DeviceLocationHistory> {
    const [history] = await db.insert(deviceLocationHistory).values(insertHistory).returning();
    return history;
  }

  async getDeviceLocationHistory(deviceId: number): Promise<DeviceLocationHistory[]> {
    return await db.select().from(deviceLocationHistory).where(eq(deviceLocationHistory.deviceId, deviceId));
  }

  async getGeofenceAlerts(): Promise<GeofenceAlert[]> {
    return await db.select().from(geofenceAlerts);
  }

  async createGeofenceAlert(insertAlert: InsertGeofenceAlert): Promise<GeofenceAlert> {
    const [alert] = await db.insert(geofenceAlerts).values(insertAlert).returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<void> {
    await db.update(geofenceAlerts).set({ isRead: true }).where(eq(geofenceAlerts.id, id));
  }
}

// Production storage using PostgreSQL database
export const storage = new DatabaseStorage();