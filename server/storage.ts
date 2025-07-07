import { 
  users, 
  devices, 
  deviceCommands, 
  chatMessages, 
  deviceLogs,
  type User, 
  type InsertUser,
  type Device,
  type InsertDevice,
  type DeviceCommand,
  type InsertDeviceCommand,
  type ChatMessage,
  type InsertChatMessage,
  type DeviceLog
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private devices: Map<number, Device> = new Map();
  private deviceCommands: Map<number, DeviceCommand> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private deviceLogs: Map<number, DeviceLog> = new Map();
  
  private currentUserId = 1;
  private currentDeviceId = 1;
  private currentCommandId = 1;
  private currentChatId = 1;
  private currentLogId = 1;

  constructor() {
    // Initialize with demo admin user
    this.createUser({
      username: "admin",
      email: "admin@fortress-mdm.com",
      password: "admin123" // In real app, this would be hashed
    });
    
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

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
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
}

export const storage = new MemStorage();
