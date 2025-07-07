
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Settings, Lock, Unlock, Power, Wifi, Battery } from 'lucide-react';

interface KioskDevice {
  id: string;
  name: string;
  imei: string;
  status: 'online' | 'offline' | 'locked';
  batteryLevel: number;
  lastSeen: string;
  currentApp: string;
  isLocked: boolean;
  config: {
    lockedApp: string;
    allowedApps: string[];
    homeScreenUrl?: string;
    disableSettings: boolean;
    disableStatusBar: boolean;
  };
}

export function KioskManagement() {
  const [devices, setDevices] = useState<KioskDevice[]>([
    {
      id: '1',
      name: 'Lobby Kiosk #1',
      imei: '356938035643809',
      status: 'online',
      batteryLevel: 85,
      lastSeen: new Date().toISOString(),
      currentApp: 'com.company.lobby',
      isLocked: true,
      config: {
        lockedApp: 'com.company.lobby',
        allowedApps: ['com.company.lobby', 'com.android.settings'],
        homeScreenUrl: 'https://lobby.company.com',
        disableSettings: true,
        disableStatusBar: true,
      }
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<KioskDevice | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  const handleLockDevice = (deviceId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, isLocked: true, status: 'locked' as const }
        : device
    ));
  };

  const handleUnlockDevice = (deviceId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, isLocked: false, status: 'online' as const }
        : device
    ));
  };

  const EnrollmentModal = () => (
    <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll New Kiosk Device</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Device Setup Instructions</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Factory reset the Android device</li>
              <li>Install the kiosk APK via ADB</li>
              <li>Set as device owner with provided command</li>
              <li>Device will auto-enroll with Firebase</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              placeholder="e.g., Lobby Kiosk #1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adbCommand">ADB Command</Label>
            <Textarea
              id="adbCommand"
              readOnly
              value="adb shell dpm set-device-owner com.company.kiosk/.MyDeviceAdminReceiver"
              rows={2}
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm">
              <strong>Note:</strong> Device must be factory reset and unprovisioned before running the ADB command.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ConfigModal = () => (
    <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Kiosk Device</DialogTitle>
        </DialogHeader>
        {selectedDevice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lockedApp">Locked App Package</Label>
                <Input
                  id="lockedApp"
                  value={selectedDevice.config.lockedApp}
                  placeholder="com.company.kioskapp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeUrl">Home Screen URL</Label>
                <Input
                  id="homeUrl"
                  value={selectedDevice.config.homeScreenUrl || ''}
                  placeholder="https://kiosk.company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allowedApps">Allowed Apps (comma-separated)</Label>
              <Textarea
                id="allowedApps"
                value={selectedDevice.config.allowedApps.join(', ')}
                placeholder="com.company.app1, com.company.app2"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="disableSettings">Disable Settings Access</Label>
                <Switch
                  id="disableSettings"
                  checked={selectedDevice.config.disableSettings}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="disableStatusBar">Hide Status Bar</Label>
                <Switch
                  id="disableStatusBar"
                  checked={selectedDevice.config.disableStatusBar}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setConfigModalOpen(false)}>
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kiosk Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage Android kiosk devices and configurations</p>
        </div>
        <Button onClick={() => setEnrollModalOpen(true)}>
          <Smartphone className="mr-2" size={16} />
          Enroll Device
        </Button>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="apps">Kiosk Apps</TabsTrigger>
          <TabsTrigger value="templates">Config Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Smartphone className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        <p className="text-sm text-gray-500">IMEI: {device.imei}</p>
                        <p className="text-sm text-gray-500">Current App: {device.currentApp}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                        {device.isLocked && (
                          <Badge variant="outline">
                            <Lock size={12} className="mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Battery size={16} />
                        <span>{device.batteryLevel}%</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDevice(device);
                            setConfigModalOpen(true);
                          }}
                        >
                          <Settings size={16} />
                        </Button>
                        
                        {device.isLocked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlockDevice(device.id)}
                          >
                            <Unlock size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLockDevice(device.id)}
                          >
                            <Lock size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apps">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Smartphone className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Kiosk Apps
                </h3>
                <p className="text-gray-500">
                  Upload and manage kiosk-compatible Android applications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Configuration Templates
                </h3>
                <p className="text-gray-500">
                  Create reusable kiosk configuration templates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EnrollmentModal />
      <ConfigModal />
    </div>
  );
}
