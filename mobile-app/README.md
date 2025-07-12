# Fortress MDM Mobile App

## Overview
The Fortress MDM Mobile App is a React Native Android application that enables devices to be managed by the Fortress MDM system. It provides enrollment, device monitoring, remote management, and kiosk mode capabilities.

## Features

### Core Functionality
- **Device Enrollment**: Secure enrollment with server URL and enrollment code
- **Real-time Status Updates**: Automatic device status reporting every 30 seconds
- **Remote Command Execution**: Lock, reboot, wipe, locate, and configuration changes
- **Kiosk Mode**: Single-app deployment with restricted system access
- **Device Admin Integration**: Android Device Admin API for advanced management

### Device Management
- **Battery Monitoring**: Real-time battery level reporting
- **Location Tracking**: GPS location reporting (with permissions)
- **Network Status**: WiFi and connectivity monitoring
- **System Information**: Device model, OS version, IMEI, serial number
- **App Management**: Monitor and control installed applications

### Security Features
- **Device Admin Rights**: Full device administration capabilities
- **Remote Lock/Wipe**: Emergency device security controls
- **Kiosk Mode**: Restrict access to approved applications only
- **Secure Communication**: Token-based authentication with MDM server

## Installation

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio
- Android SDK 28+
- Java JDK 11+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fortress-mdm/mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Android Setup**
   ```bash
   # Install Android dependencies
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run on Android**
   ```bash
   npm run android
   ```

## Configuration

### Server Configuration
The app connects to your Fortress MDM server. Update the server URL during enrollment:

```typescript
// Default enrollment code (change in production)
const ENROLLMENT_CODE = 'FORTRESS-MDM-2025';

// Server URL format
const SERVER_URL = 'https://your-mdm-server.com';
```

### Device Admin Setup
The app requires Device Admin permissions for advanced management:

1. **Enable Device Admin**
   - Settings > Security > Device Administrators
   - Enable "Fortress MDM Device Admin"

2. **Grant Permissions**
   - Location access for device tracking
   - Phone access for IMEI/device information
   - Network access for status updates

## API Integration

### Enrollment
```typescript
POST /api/enroll
{
  "enrollmentCode": "FORTRESS-MDM-2025",
  "deviceInfo": {
    "deviceName": "Samsung Galaxy",
    "imei": "123456789012345",
    "serialNumber": "ABC123",
    "osVersion": "13",
    "batteryLevel": 85,
    "location": { "latitude": 37.7749, "longitude": -122.4194 }
  }
}
```

### Status Updates
```typescript
POST /api/device/status
Authorization: Bearer <device_token>
{
  "batteryLevel": 75,
  "location": { "latitude": 37.7749, "longitude": -122.4194 },
  "isOnline": true,
  "wifiEnabled": true,
  "isKioskMode": false
}
```

### Command Polling
```typescript
GET /api/device/commands
Authorization: Bearer <device_token>

Response: [
  {
    "id": "cmd_123",
    "command": "lock",
    "parameters": {},
    "timestamp": "2025-01-07T19:30:00Z"
  }
]
```

## Device Commands

### Supported Commands
- **lock**: Lock the device immediately
- **reboot**: Restart the device
- **wipe**: Factory reset the device
- **locate**: Update GPS location
- **enable_wifi**: Enable WiFi
- **disable_wifi**: Disable WiFi
- **enable_kiosk**: Enter kiosk mode
- **disable_kiosk**: Exit kiosk mode

### Command Execution
Commands are executed automatically when received from the server. Results are reported back:

```typescript
POST /api/device/command/{commandId}/result
{
  "success": true,
  "error": null,
  "timestamp": "2025-01-07T19:30:00Z"
}
```

## Kiosk Mode

### Features
- **Single App Lock**: Restrict device to one application
- **System UI Hidden**: Hide status bar and navigation
- **Lock Task Mode**: Prevent app switching
- **Remote Control**: Enable/disable via MDM server

### Implementation
```typescript
// Enable kiosk mode
await KioskModule.enterKioskMode('com.example.app');

// Disable kiosk mode
await KioskModule.exitKioskMode();
```

## Security Considerations

### Device Admin Permissions
The app requires extensive permissions for device management:
- **Force Lock**: Lock device screen
- **Wipe Data**: Factory reset device
- **Set Password**: Enforce password policies
- **Disable Camera**: Control camera access
- **Encrypted Storage**: Require device encryption

### Production Deployment
1. **Change enrollment code** from default
2. **Implement proper JWT tokens** for authentication
3. **Use HTTPS** for all server communication
4. **Enable certificate pinning** for API security
5. **Implement device verification** for enrollment

## Development

### File Structure
```
mobile-app/
├── src/
│   ├── components/
│   │   ├── EnrollmentScreen.tsx
│   │   └── DashboardScreen.tsx
│   ├── services/
│   │   └── MDMService.ts
│   └── App.tsx
├── android/
│   └── app/src/main/java/com/fortressmdm/mobile/
│       ├── DeviceAdminReceiver.java
│       ├── DeviceAdminModule.java
│       └── KioskModule.java
└── package.json
```

### Native Modules
- **DeviceAdminModule**: Android Device Admin API integration
- **KioskModule**: Kiosk mode implementation
- **MDMService**: Core device management service

### Testing
```bash
# Run tests
npm test

# Run on Android emulator
npm run android

# Debug mode
npm run android -- --variant=debug
```

## Production Build

### Release Build
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (for Play Store)
./gradlew bundleRelease
```

### Distribution
1. **Enterprise Distribution**: Deploy APK via MDM or internal app store
2. **Play Store**: Upload AAB to Google Play Console
3. **Direct Install**: ADB install for testing

## Troubleshooting

### Common Issues
- **Device Admin not working**: Check device admin permissions
- **Kiosk mode not activating**: Verify lock task mode permissions
- **Network errors**: Check server URL and network connectivity
- **GPS not working**: Verify location permissions

### Debug Commands
```bash
# Check device logs
adb logcat | grep "FortressMDM"

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Check device admin status
adb shell dpm list-owners
```

## Support

For technical support or feature requests, contact the development team or refer to the main Fortress MDM documentation.

---

**Fortress MDM Mobile App** - Complete device management for Android devices.