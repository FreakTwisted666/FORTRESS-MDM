import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeviceSchema, insertDeviceCommandSchema, insertChatMessageSchema, type Device } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are now handled in setupAuth

  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  // Kiosk management endpoints
  app.post("/api/devices/:id/kiosk", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { enabled, config } = req.body;
      
      const updates = {
        isKioskMode: enabled,
        kioskConfig: config || {},
        updatedAt: new Date()
      };
      
      const updatedDevice = await storage.updateDevice(deviceId, updates);
      
      // Log the kiosk action
      await storage.createDeviceLog({
        deviceId,
        action: enabled ? "kiosk_enabled" : "kiosk_disabled",
        details: { config }
      });
      
      res.json(updatedDevice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update kiosk mode" });
    }
  });

  // Device control endpoints for rules
  app.post("/api/devices/:id/controls", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { action, enabled } = req.body;
      
      // Validate control actions
      const validActions = ['wifi', 'mobile_data', 'gps', 'bluetooth', 'camera', 'microphone', 'usb'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ message: "Invalid control action" });
      }
      
      // Create device command for the control action
      await storage.createDeviceCommand({
        deviceId,
        command: `${action}_${enabled ? 'enable' : 'disable'}`,
        status: "pending"
      });
      
      // Log the control action
      await storage.createDeviceLog({
        deviceId,
        action: `${action}_${enabled ? 'enabled' : 'disabled'}`,
        details: { action, enabled }
      });
      
      res.json({ 
        message: `${action} ${enabled ? 'enabled' : 'disabled'} successfully`,
        command: `${action}_${enabled ? 'enable' : 'disable'}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to execute device control" });
    }
  });

  // Bulk device control endpoint
  app.post("/api/devices/bulk/controls", async (req, res) => {
    try {
      const { deviceIds, controls } = req.body;
      
      if (!Array.isArray(deviceIds) || !controls) {
        return res.status(400).json({ message: "Invalid request format" });
      }
      
      const results = [];
      
      for (const deviceId of deviceIds) {
        for (const [action, enabled] of Object.entries(controls)) {
          await storage.createDeviceCommand({
            deviceId,
            command: `${action}_${enabled ? 'enable' : 'disable'}`,
            status: "pending"
          });
          
          await storage.createDeviceLog({
            deviceId,
            action: `bulk_${action}_${enabled ? 'enabled' : 'disabled'}`,
            details: { action, enabled, bulk: true }
          });
        }
        
        results.push({ deviceId, status: "commands_queued" });
      }
      
      res.json({ 
        message: `Bulk controls applied to ${deviceIds.length} devices`,
        results 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to execute bulk controls" });
    }
  });

  // Kiosk device enrollment endpoint
  app.post("/api/kiosk/enroll", async (req, res) => {
    try {
      const { imei, fcmToken, deviceInfo } = req.body;
      
      // Create or update kiosk device
      const device = {
        id: `kiosk_${imei}`,
        name: deviceInfo.name || `Kiosk ${imei}`,
        type: 'Android Kiosk',
        status: 'online',
        lastSeen: new Date().toISOString(),
        osVersion: deviceInfo.osVersion || 'Unknown',
        batteryLevel: deviceInfo.batteryLevel || 100,
        imei,
        fcmToken,
        isKiosk: true,
        kioskConfig: {
          lockedApp: 'com.company.kiosk',
          allowedApps: ['com.company.kiosk'],
          disableSettings: true,
          disableStatusBar: true
        }
      };
      
      res.json({ success: true, deviceId: device.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to enroll kiosk device" });
    }
  });

  // Kiosk configuration update endpoint
  app.put("/api/kiosk/:deviceId/config", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { config } = req.body;
      
      // Update device configuration
      // This would trigger a Firebase update that the Android app listens to
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update kiosk configuration" });
    }
  });

  // Kiosk device control endpoints
  app.post("/api/kiosk/:deviceId/lock", async (req, res) => {
    try {
      const { deviceId } = req.params;
      // Send FCM message to lock device
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to lock device" });
    }
  });

  app.post("/api/kiosk/:deviceId/unlock", async (req, res) => {
    try {
      const { deviceId } = req.params;
      // Send FCM message to unlock device
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlock device" });
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

  // Emergency device actions endpoint
  app.post("/api/devices/:id/emergency", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { action, adminPassword, reason } = req.body;
      
      // Validate admin password against environment variable
      if (!adminPassword || adminPassword !== process.env.ADMIN_EMERGENCY_PASSWORD) {
        return res.status(401).json({ message: "Invalid admin password" });
      }
      
      // Validate action
      if (!['lock', 'wipe'].includes(action)) {
        return res.status(400).json({ message: "Invalid emergency action" });
      }
      
      // Create emergency command
      const emergencyCommand = await storage.createDeviceCommand({
        deviceId,
        command: `emergency_${action}`,
        status: "pending",
        issuedBy: "admin", // Admin user
      });
      
      // Log the emergency action
      await storage.createDeviceLog({
        deviceId,
        action: `emergency_${action}`,
        details: { 
          action, 
          reason, 
          timestamp: new Date().toISOString(),
          adminPassword: '***' // Never log actual passwords
        }
      });
      
      res.json({ 
        message: `Emergency ${action} command sent successfully`,
        commandId: emergencyCommand.id
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to execute emergency action" });
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
      let response = "I'm here to help with enterprise device management. ";
      
      const lowerMessage = message.toLowerCase();
      
      // Kiosk management commands
      if (lowerMessage.includes("kiosk") && (lowerMessage.includes("enable") || lowerMessage.includes("activate"))) {
        const devices = await storage.getDevices();
        const nonKioskDevices = devices.filter((d: Device) => !d.isKioskMode);
        response += `Found ${nonKioskDevices.length} devices ready for kiosk mode. Use the Kiosk Management page to configure SSO authentication and enable kiosk mode with single app deployment.`;
      } else if (lowerMessage.includes("kiosk") && (lowerMessage.includes("sso") || lowerMessage.includes("single sign"))) {
        response += "SSO kiosk configuration supports multiple providers: SAML 2.0, OAuth 2.0, OpenID Connect, LDAP/Active Directory, Azure AD, and Google Workspace. Configure auto-login, session timeout, and force logout settings in the Kiosk Management section.";
      } else if (lowerMessage.includes("wifi") && (lowerMessage.includes("enable") || lowerMessage.includes("disable") || lowerMessage.includes("control"))) {
        const imeiMatch = lowerMessage.match(/\d{15}/);
        if (imeiMatch) {
          const imei = imeiMatch[0];
          const device = await storage.getDeviceByImei(imei);
          if (device) {
            const action = lowerMessage.includes("disable") ? "disable" : "enable";
            response += `${action === "enable" ? "Enabling" : "Disabling"} WiFi on device ${device.name} (IMEI: ${imei})...`;
            await storage.createDeviceCommand({
              deviceId: device.id,
              command: `wifi_${action}`,
              issuedBy: userId,
            });
            await storage.createDeviceLog({
              deviceId: device.id,
              action: `wifi_${action}d`,
              details: { source: "chat_assistant" }
            });
          } else {
            response += `Device with IMEI ${imei} not found.`;
          }
        } else {
          response += "To control WiFi, specify device IMEI: 'enable wifi on device 123456789012345' or use bulk controls from Kiosk Management.";
        }
      } else if (lowerMessage.includes("mobile data") || lowerMessage.includes("cellular")) {
        const imeiMatch = lowerMessage.match(/\d{15}/);
        if (imeiMatch) {
          const imei = imeiMatch[0];
          const device = await storage.getDeviceByImei(imei);
          if (device) {
            const action = lowerMessage.includes("disable") ? "disable" : "enable";
            response += `${action === "enable" ? "Enabling" : "Disabling"} mobile data on device ${device.name}...`;
            await storage.createDeviceCommand({
              deviceId: device.id,
              command: `mobile_data_${action}`,
              issuedBy: userId,
            });
          } else {
            response += `Device with IMEI ${imei} not found.`;
          }
        } else {
          response += "Specify device IMEI to control mobile data: 'disable mobile data on 123456789012345'";
        }
      } else if (lowerMessage.includes("gps") && (lowerMessage.includes("enable") || lowerMessage.includes("activate") || lowerMessage.includes("location"))) {
        const imeiMatch = lowerMessage.match(/\d{15}/);
        if (imeiMatch) {
          const imei = imeiMatch[0];
          const device = await storage.getDeviceByImei(imei);
          if (device) {
            response += `Activating GPS location services on device ${device.name}...`;
            await storage.createDeviceCommand({
              deviceId: device.id,
              command: "gps_enable",
              issuedBy: userId,
            });
          } else {
            response += `Device with IMEI ${imei} not found.`;
          }
        } else {
          response += "Specify device IMEI to control GPS: 'activate gps on 123456789012345'";
        }
      } else if (lowerMessage.includes("bulk") && (lowerMessage.includes("control") || lowerMessage.includes("apply"))) {
        const devices = await storage.getDevices();
        response += `Bulk controls available for ${devices.length} devices. Use 'Apply Rules' in Kiosk Management to enable/disable WiFi, mobile data, GPS, and Bluetooth across all devices simultaneously.`;
      } else if (lowerMessage.includes("offline") || lowerMessage.includes("offline devices")) {
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
        const kioskMode = devices.filter((d: Device) => d.isKioskMode).length;
        response += `Device Status: ${online} online, ${offline} offline, ${warning} warning, ${kioskMode} in kiosk mode`;
      } else if (lowerMessage.includes("help") || lowerMessage.includes("commands")) {
        response += `Available commands:
• Device Status: 'show device status', 'offline devices'  
• Device Control: 'enable wifi on IMEI', 'disable mobile data on IMEI', 'activate gps on IMEI'
• Kiosk Management: 'enable kiosk mode', 'configure SSO authentication'
• Device Actions: 'lock device with IMEI 123456789012345'
• Bulk Operations: 'apply bulk controls to all devices'
• Interface: Dark mode toggle available in header

Enterprise features: SSO authentication, device control rules, policy enforcement, comprehensive analytics, and adaptive dark/light theming.`;
      } else {
        response += "Try commands like 'show device status', 'enable wifi on [IMEI]', 'configure kiosk mode', or 'help' for more options.";
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

  // Mobile device enrollment endpoint
  app.post('/api/enroll', async (req, res) => {
    try {
      const { enrollmentCode, deviceInfo } = req.body;
      
      // Validate enrollment code against environment variable
      if (!enrollmentCode || enrollmentCode !== process.env.MDM_ENROLLMENT_CODE) {
        return res.status(400).json({ error: 'Invalid enrollment code' });
      }
      
      // Create device record
      const device = await storage.createDevice({
        name: deviceInfo.deviceName,
        imei: deviceInfo.imei,
        serialNumber: deviceInfo.serialNumber,
        model: deviceInfo.deviceName,
        osVersion: `Android ${deviceInfo.osVersion}`,
        status: 'online',
        batteryLevel: deviceInfo.batteryLevel,
        lastSeen: new Date(),
        location: deviceInfo.location ? JSON.stringify(deviceInfo.location) : null,
        isKioskMode: false,
        kioskConfig: null,
      });
      
      // Generate device token
      const deviceToken = `device_${device.id}_${Date.now()}`;
      
      // Log enrollment
      await storage.createDeviceLog({
        deviceId: device.id,
        action: 'enrolled',
        details: { token: deviceToken, appVersion: deviceInfo.appVersion }
      });
      
      res.json({ 
        success: true, 
        token: deviceToken,
        deviceId: device.id,
        serverVersion: '1.0.0'
      });
    } catch (error) {
      console.error('Device enrollment error:', error);
      res.status(500).json({ error: 'Enrollment failed' });
    }
  });

  // Mobile device status update endpoint
  app.post('/api/device/status', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.substring(7);
      const deviceInfo = req.body;
      
      // Find device by token
      const devices = await storage.getDevices();
      const device = devices.find(d => token.includes(`device_${d.id}_`));
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      // Update device status
      await storage.updateDevice(device.id, {
        batteryLevel: deviceInfo.batteryLevel,
        lastSeen: new Date(),
        location: deviceInfo.location ? JSON.stringify(deviceInfo.location) : null,
        status: deviceInfo.isOnline ? 'online' : 'offline',
        isKioskMode: deviceInfo.isKioskMode,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Device status update error:', error);
      res.status(500).json({ error: 'Status update failed' });
    }
  });

  // Mobile device commands endpoint
  app.get('/api/device/commands', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.substring(7);
      const devices = await storage.getDevices();
      const device = devices.find(d => token.includes(`device_${d.id}_`));
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      // Get pending commands
      const commands = await storage.getDeviceCommands(device.id);
      const pendingCommands = commands.filter(cmd => cmd.status === 'pending');
      
      res.json(pendingCommands);
    } catch (error) {
      console.error('Device commands error:', error);
      res.status(500).json({ error: 'Failed to fetch commands' });
    }
  });

  // Policy management endpoints
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", async (req, res) => {
    try {
      const policyData = req.body;
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      res.status(400).json({ message: "Failed to create policy" });
    }
  });

  app.put("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const policy = await storage.updatePolicy(id, updates);
      res.json(policy);
    } catch (error) {
      res.status(400).json({ message: "Failed to update policy" });
    }
  });

  app.delete("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePolicy(id);
      res.json({ message: "Policy deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete policy" });
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
      
      // Calculate real policy violations and critical alerts
      const policyViolations = devices.filter((d: Device) => 
        d.status === "warning" || !d.lastSeen || 
        (new Date().getTime() - new Date(d.lastSeen).getTime()) > 24 * 60 * 60 * 1000
      ).length;
      const criticalAlerts = devices.filter((d: Device) => 
        d.status === "offline" || (d.batteryLevel !== null && d.batteryLevel < 15)
      ).length;
      
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
