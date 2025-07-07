import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDeviceSchema, insertDeviceCommandSchema, insertChatMessageSchema, type Device } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper session management
      res.json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ message: "Invalid device data" });
    }
  });

  app.put("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const device = await storage.updateDevice(id, updates);
      res.json(device);
    } catch (error) {
      res.status(400).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDevice(id);
      res.json({ message: "Device deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete device" });
    }
  });

  // Device command routes
  app.post("/api/devices/:id/commands", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { command, issuedBy } = insertDeviceCommandSchema.parse({
        ...req.body,
        deviceId,
      });
      
      const deviceCommand = await storage.createDeviceCommand({
        deviceId,
        command,
        issuedBy,
      });
      
      // Log the command
      await storage.createDeviceLog({
        deviceId,
        action: `command_issued_${command}`,
        details: { commandId: deviceCommand.id, issuedBy },
      });
      
      res.status(201).json(deviceCommand);
    } catch (error) {
      res.status(400).json({ message: "Failed to create device command" });
    }
  });

  app.get("/api/devices/:id/commands", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const commands = await storage.getDeviceCommands(deviceId);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device commands" });
    }
  });

  app.get("/api/devices/:id/logs", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const logs = await storage.getDeviceLogs(deviceId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device logs" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = insertChatMessageSchema.parse(req.body);
      
      // Process the chat message and generate a response
      let response = "I'm here to help with device management. ";
      
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("offline") || lowerMessage.includes("offline devices")) {
        const devices = await storage.getDevices();
        const offlineDevices = devices.filter((d: Device) => d.status === "offline");
        response += `Found ${offlineDevices.length} offline devices: ${offlineDevices.map((d: Device) => d.name).join(", ")}`;
      } else if (lowerMessage.includes("lock") && lowerMessage.includes("imei")) {
        const imeiMatch = lowerMessage.match(/\d{15}/);
        if (imeiMatch) {
          const imei = imeiMatch[0];
          const device = await storage.getDeviceByImei(imei);
          if (device) {
            response += `Locking device ${device.name} (IMEI: ${imei})...`;
            await storage.createDeviceCommand({
              deviceId: device.id,
              command: "lock",
              issuedBy: userId,
            });
          } else {
            response += `Device with IMEI ${imei} not found.`;
          }
        } else {
          response += "Please provide a valid IMEI number (15 digits).";
        }
      } else if (lowerMessage.includes("status") || lowerMessage.includes("devices")) {
        const devices = await storage.getDevices();
        const online = devices.filter((d: Device) => d.status === "online").length;
        const offline = devices.filter((d: Device) => d.status === "offline").length;
        const warning = devices.filter((d: Device) => d.status === "warning").length;
        response += `Device Status: ${online} online, ${offline} offline, ${warning} warning`;
      } else {
        response += "Try commands like 'show offline devices', 'lock device with IMEI 123456789012345', or 'device status'.";
      }
      
      const chatMessage = await storage.createChatMessage({
        userId,
        message,
      });
      
      // Update the chat message with the response
      const updatedChatMessage = { ...chatMessage, response };
      
      res.json(updatedChatMessage);
    } catch (error) {
      res.status(400).json({ message: "Failed to process chat message" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      const totalDevices = devices.length;
      const onlineDevices = devices.filter((d: Device) => d.status === "online").length;
      const offlineDevices = devices.filter((d: Device) => d.status === "offline").length;
      const warningDevices = devices.filter((d: Device) => d.status === "warning").length;
      
      // Mock policy violations and critical alerts
      const policyViolations = 23;
      const criticalAlerts = 5;
      
      res.json({
        totalDevices,
        onlineDevices,
        offlineDevices,
        warningDevices,
        policyViolations,
        criticalAlerts,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
