import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import WifiManager from 'react-native-wifi-reborn';
import { getBatteryLevel } from 'react-native-battery-level';

export interface DeviceStatus {
  imei: string;
  serialNumber: string;
  deviceName: string;
  batteryLevel: number;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  isOnline: boolean;
  wifiEnabled: boolean;
  lastSeen: Date;
  appVersion: string;
  osVersion: string;
  isKioskMode: boolean;
}

export interface MDMCommand {
  id: string;
  command: 'lock' | 'reboot' | 'wipe' | 'locate' | 'enable_wifi' | 'disable_wifi' | 'enable_kiosk' | 'disable_kiosk';
  parameters?: any;
  timestamp: Date;
}

class MDMService {
  private static instance: MDMService;
  private serverUrl: string = 'YOUR_SERVER_URL'; // Will be configured during enrollment
  private deviceToken: string | null = null;
  private isEnrolled: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeService();
  }

  static getInstance(): MDMService {
    if (!MDMService.instance) {
      MDMService.instance = new MDMService();
    }
    return MDMService.instance;
  }

  private async initializeService() {
    // Check if device is already enrolled
    const token = await AsyncStorage.getItem('device_token');
    const serverUrl = await AsyncStorage.getItem('server_url');

    if (token && serverUrl) {
      this.deviceToken = token;
      this.serverUrl = serverUrl;
      this.isEnrolled = true;
      this.startHeartbeat();
    }
  }

  // Device Enrollment
  async enrollDevice(serverUrl: string, enrollmentCode: string): Promise<boolean> {
    try {
      const deviceInfo = await this.getDeviceInfo();

      const response = await fetch(`${serverUrl}/api/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentCode,
          deviceInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.deviceToken = data.token;
        this.serverUrl = serverUrl;
        this.isEnrolled = true;

        // Store enrollment data
        await AsyncStorage.setItem('device_token', this.deviceToken);
        await AsyncStorage.setItem('server_url', serverUrl);

        this.startHeartbeat();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Enrollment failed:', error);
      return false;
    }
  }

  // Get comprehensive device information
  private async getDeviceInfo(): Promise<DeviceStatus> {
    const imei = await DeviceInfo.getUniqueId();
    const serialNumber = await DeviceInfo.getSerialNumber();
    const deviceName = await DeviceInfo.getDeviceName();
    const appVersion = DeviceInfo.getVersion();
    const osVersion = DeviceInfo.getSystemVersion();
    const batteryLevel = await getBatteryLevel();
    const netInfo = await NetInfo.fetch();
    const wifiEnabled = await WifiManager.isEnabled();
    const location = await this.getCurrentLocation();
    const isKioskMode = await this.isInKioskMode();

    return {
      imei,
      serialNumber,
      deviceName,
      batteryLevel: Math.round(batteryLevel * 100),
      location,
      isOnline: netInfo.isConnected || false,
      wifiEnabled,
      lastSeen: new Date(),
      appVersion,
      osVersion,
      isKioskMode,
    };
  }

  // Get current location
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return new Promise((resolve) => {
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Location error:', error);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });
      }
      return null;
    } catch (error) {
      console.error('Location permission error:', error);
      return null;
    }
  }

  // Check if device is in kiosk mode
  private async isInKioskMode(): Promise<boolean> {
    try {
      const kioskStatus = await AsyncStorage.getItem('kiosk_mode');
      return kioskStatus === 'true';
    } catch (error) {
      return false;
    }
  }

  // Send device status to server
  async sendDeviceStatus(): Promise<void> {
    if (!this.isEnrolled || !this.deviceToken) {
      return;
    }

    try {
      const deviceStatus = await this.getDeviceInfo();

      const response = await fetch(`${this.serverUrl}/api/device/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deviceToken}`,
        },
        body: JSON.stringify(deviceStatus),
      });

      if (response.ok) {
        console.log('Device status sent successfully');
      }
    } catch (error) {
      console.error('Failed to send device status:', error);
    }
  }

  // Check for pending commands
  async checkForCommands(): Promise<MDMCommand[]> {
    if (!this.isEnrolled || !this.deviceToken) {
      return [];
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/device/commands`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.deviceToken}`,
        },
      });

      if (response.ok) {
        const commands = await response.json();
        return commands.map((cmd: any) => ({
          id: cmd.id,
          command: cmd.command,
          parameters: cmd.parameters,
          timestamp: new Date(cmd.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to check commands:', error);
      return [];
    }
  }

  // Execute MDM command
  async executeCommand(command: MDMCommand): Promise<boolean> {
    try {
      switch (command.command) {
        case 'lock':
          return await this.lockDevice();
        case 'reboot':
          return await this.rebootDevice();
        case 'wipe':
          return await this.wipeDevice();
        case 'locate':
          return await this.updateLocation();
        case 'enable_wifi':
          return await this.enableWifi();
        case 'disable_wifi':
          return await this.disableWifi();
        case 'enable_kiosk':
          return await this.enableKioskMode(command.parameters?.appPackage);
        case 'disable_kiosk':
          return await this.disableKioskMode();
        default:
          console.warn('Unknown command:', command.command);
          return false;
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      return false;
    }
  }

  // Device control methods
  private async lockDevice(): Promise<boolean> {
    try {
      // Implement device lock using Device Admin API
      const { DeviceAdminModule } = require('../native/DeviceAdminModule');
      return await DeviceAdminModule.lockDevice();
    } catch (error) {
      console.error('Lock device failed:', error);
      return false;
    }
  }

  private async rebootDevice(): Promise<boolean> {
    try {
      const { DeviceAdminModule } = require('../native/DeviceAdminModule');
      return await DeviceAdminModule.rebootDevice();
    } catch (error) {
      console.error('Reboot device failed:', error);
      return false;
    }
  }

  private async wipeDevice(): Promise<boolean> {
    try {
      const { DeviceAdminModule } = require('../native/DeviceAdminModule');
      return await DeviceAdminModule.wipeDevice();
    } catch (error) {
      console.error('Wipe device failed:', error);
      return false;
    }
  }

  private async updateLocation(): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      if (location) {
        // Send location update to server
        await this.sendDeviceStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update location failed:', error);
      return false;
    }
  }

  private async enableWifi(): Promise<boolean> {
    try {
      await WifiManager.setEnabled(true);
      return true;
    } catch (error) {
      console.error('Enable WiFi failed:', error);
      return false;
    }
  }

  private async disableWifi(): Promise<boolean> {
    try {
      await WifiManager.setEnabled(false);
      return true;
    } catch (error) {
      console.error('Disable WiFi failed:', error);
      return false;
    }
  }

  private async enableKioskMode(appPackage?: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem('kiosk_mode', 'true');
      if (appPackage) {
        await AsyncStorage.setItem('kiosk_app', appPackage);
      }

      const { KioskModule } = require('../native/KioskModule');
      return await KioskModule.enterKioskMode(appPackage);
    } catch (error) {
      console.error('Enable kiosk mode failed:', error);
      return false;
    }
  }

  private async disableKioskMode(): Promise<boolean> {
    try {
      await AsyncStorage.setItem('kiosk_mode', 'false');
      await AsyncStorage.removeItem('kiosk_app');

      const { KioskModule } = require('../native/KioskModule');
      return await KioskModule.exitKioskMode();
    } catch (error) {
      console.error('Disable kiosk mode failed:', error);
      return false;
    }
  }

  // Report command execution result
  async reportCommandResult(commandId: string, success: boolean, error?: string): Promise<void> {
    if (!this.isEnrolled || !this.deviceToken) {
      return;
    }

    try {
      await fetch(`${this.serverUrl}/api/device/command/${commandId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deviceToken}`,
        },
        body: JSON.stringify({
          success,
          error,
          timestamp: new Date(),
        }),
      });
    } catch (error) {
      console.error('Failed to report command result:', error);
    }
  }

  // Start heartbeat service
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.sendDeviceStatus();

      // Check for pending commands
      const commands = await this.checkForCommands();
      for (const command of commands) {
        const success = await this.executeCommand(command);
        await this.reportCommandResult(command.id, success);
      }
    }, 30000); // 30 seconds interval
  }

  // Stop heartbeat service
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Unenroll device
  async unenrollDevice(): Promise<boolean> {
    try {
      if (this.isEnrolled && this.deviceToken) {
        await fetch(`${this.serverUrl}/api/device/unenroll`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.deviceToken}`,
          },
        });
      }

      // Clear local data
      await AsyncStorage.removeItem('device_token');
      await AsyncStorage.removeItem('server_url');
      await AsyncStorage.removeItem('kiosk_mode');
      await AsyncStorage.removeItem('kiosk_app');

      this.stopHeartbeat();
      this.isEnrolled = false;
      this.deviceToken = null;

      return true;
    } catch (error) {
      console.error('Unenroll failed:', error);
      return false;
    }
  }
}

// Production configuration
const DEFAULT_SERVER_URL = process.env.REPLIT_DEV_DOMAIN || 'https://your-repl-name.your-username.replit.app';
const DEFAULT_ENROLLMENT_CODE = 'FORTRESS-ENTERPRISE-2025-SECURE';

export default MDMService;