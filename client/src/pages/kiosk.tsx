import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Monitor, 
  Smartphone, 
  Settings, 
  Lock, 
  Unlock, 
  RotateCcw,
  Download,
  Upload,
  QrCode,
  Wifi,
  Volume2,
  Battery,
  MapPin
} from "lucide-react";
import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { KioskAdminUnlock, useKioskAdminUnlock } from "@/components/mdm/kiosk-admin-unlock";

interface KioskDevice {
  id: number;
  name: string;
  imei: string;
  status: "online" | "offline" | "warning";
  batteryLevel: number;
  location: string;
  isKioskMode: boolean;
  kioskApp: string;
  lastSeen: Date;
  kioskConfig: {
    allowedApps: string[];
    restrictedFeatures: string[];
    autoLaunchApp: string;
    exitPassword: string;
    screenTimeout: number;
    volumeControl: boolean;
    wifiSettings: boolean;
  };
}

export default function Kiosk() {
  const [selectedDevice, setSelectedDevice] = useState<KioskDevice | null>(null);
  const { showUnlock, tapCount, handleUnlock, handleCancel } = useKioskAdminUnlock();
  const [kioskConfig, setKioskConfig] = useState({
    allowedApps: ["com.company.kioskapp"],
    restrictedFeatures: ["camera", "bluetooth", "usb"],
    autoLaunchApp: "com.company.kioskapp",
    appDisplayName: "Enterprise Portal",
    exitPassword: "admin123",
    screenTimeout: 300,
    volumeControl: false,
    wifiSettings: false,
    // SSO Configuration
    ssoEnabled: false,
    ssoProvider: "oidc",
    ssoDomain: "",
    ssoEndpoint: "",
    ssoClientId: "",
    ssoSessionTimeout: 480,
    autoLogin: false,
    rememberSessions: true,
    forceLogoutOnExit: true,
    // Device Control Rules
    wifiEnabled: true,
    mobileDataEnabled: true,
    gpsEnabled: true,
    bluetoothEnabled: false,
    cameraEnabled: false,
    microphoneEnabled: false,
    usbEnabled: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["/api/devices"],
  });

  const kioskDevices: KioskDevice[] = devices?.map((d: any) => ({
    ...d,
    kioskConfig: d.kioskConfig || kioskConfig,
  })) || [];

  const enableKioskMutation = useMutation({
    mutationFn: async ({ deviceId, config }: { deviceId: number; config: any }) => {
      return apiRequest(`/api/devices/${deviceId}/kiosk`, {
        method: "POST",
        body: JSON.stringify({ enabled: true, config }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Kiosk Mode Enabled",
        description: "Device has been configured for kiosk mode with SSO",
      });
    },
  });

  const disableKioskMutation = useMutation({
    mutationFn: async (deviceId: number) => {
      return apiRequest(`/api/devices/${deviceId}/kiosk`, {
        method: "POST",
        body: JSON.stringify({ enabled: false }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Kiosk Mode Disabled",
        description: "Device has been returned to normal mode",
      });
    },
  });

  const deviceControlMutation = useMutation({
    mutationFn: async ({ deviceId, action, enabled }: { deviceId: number; action: string; enabled: boolean }) => {
      return apiRequest(`/api/devices/${deviceId}/controls`, {
        method: "POST",
        body: JSON.stringify({ action, enabled }),
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Device Control Updated",
        description: `${variables.action} has been ${variables.enabled ? 'enabled' : 'disabled'}`,
      });
    },
  });

  const bulkControlMutation = useMutation({
    mutationFn: async ({ deviceIds, controls }: { deviceIds: number[]; controls: any }) => {
      return apiRequest(`/api/devices/bulk/controls`, {
        method: "POST",
        body: JSON.stringify({ deviceIds, controls }),
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Bulk Controls Applied",
        description: `Controls applied to ${variables.deviceIds.length} devices`,
      });
    },
  });

  const handleEnableKiosk = (device: KioskDevice) => {
    enableKioskMutation.mutate({
      deviceId: device.id,
      config: kioskConfig,
    });
  };

  const handleDisableKiosk = (deviceId: number) => {
    disableKioskMutation.mutate(deviceId);
  };

  const DeviceCard = ({ device }: { device: KioskDevice }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setSelectedDevice(device)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {device.deviceType === "android" ? (
                <Smartphone className="text-blue-600 dark:text-blue-400" size={20} />
              ) : (
                <Monitor className="text-blue-600 dark:text-blue-400" size={20} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{device.name}</h3>
              <p className="text-sm text-gray-500">{device.imei}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={device.status === "online" ? "default" : "secondary"}>
              {device.status}
            </Badge>
            {device.isKioskMode && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Lock size={12} className="mr-1" />
                Kiosk
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Battery size={16} className="text-gray-400" />
            <span>{device.batteryLevel}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-400" />
            <span className="truncate">{device.location}</span>
          </div>
        </div>
        {device.isKioskMode && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kiosk App: {device.kioskConfig.autoLaunchApp}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const KioskConfigPanel = ({ device }: { device: KioskDevice }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Kiosk Configuration</h3>
        <div className="flex space-x-2">
          {device.isKioskMode ? (
            <Button
              variant="outline"
              onClick={() => handleDisableKiosk(device.id)}
              disabled={disableKioskMutation.isPending}
            >
              <Unlock className="mr-2" size={16} />
              Disable Kiosk
            </Button>
          ) : (
            <Button
              onClick={() => handleEnableKiosk(device)}
              disabled={enableKioskMutation.isPending}
            >
              <Lock className="mr-2" size={16} />
              Enable Kiosk
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="apps" className="w-full">
        <TabsList>
          <TabsTrigger value="apps">Allowed Apps</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Single App SSO Mode</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Configure enterprise single sign-on for a dedicated kiosk application
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={kioskConfig.ssoEnabled}
                onCheckedChange={(checked) => setKioskConfig({
                  ...kioskConfig,
                  ssoEnabled: checked
                })}
              />
              <Label>Enable SSO Authentication</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary App Package</Label>
              <Input
                value={kioskConfig.autoLaunchApp}
                onChange={(e) => setKioskConfig({
                  ...kioskConfig,
                  autoLaunchApp: e.target.value
                })}
                placeholder="com.company.kioskapp"
              />
              <p className="text-xs text-gray-500 mt-1">Main application for kiosk mode</p>
            </div>
            <div>
              <Label>App Display Name</Label>
              <Input
                value={kioskConfig.appDisplayName}
                onChange={(e) => setKioskConfig({
                  ...kioskConfig,
                  appDisplayName: e.target.value
                })}
                placeholder="Enterprise Portal"
              />
            </div>
          </div>

          {kioskConfig.ssoEnabled && (
            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium">SSO Configuration</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SSO Provider</Label>
                  <Select
                    value={kioskConfig.ssoProvider}
                    onValueChange={(value) => setKioskConfig({
                      ...kioskConfig,
                      ssoProvider: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saml">SAML 2.0</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="oidc">OpenID Connect</SelectItem>
                      <SelectItem value="ldap">LDAP/Active Directory</SelectItem>
                      <SelectItem value="azure">Azure AD</SelectItem>
                      <SelectItem value="google">Google Workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Domain</Label>
                  <Input
                    value={kioskConfig.ssoDomain}
                    onChange={(e) => setKioskConfig({
                      ...kioskConfig,
                      ssoDomain: e.target.value
                    })}
                    placeholder="company.com"
                  />
                </div>
              </div>
              
              <div>
                <Label>SSO Endpoint URL</Label>
                <Input
                  value={kioskConfig.ssoEndpoint}
                  onChange={(e) => setKioskConfig({
                    ...kioskConfig,
                    ssoEndpoint: e.target.value
                  })}
                  placeholder="https://login.company.com/auth"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client ID</Label>
                  <Input
                    value={kioskConfig.ssoClientId}
                    onChange={(e) => setKioskConfig({
                      ...kioskConfig,
                      ssoClientId: e.target.value
                    })}
                    placeholder="your-client-id"
                  />
                </div>
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={kioskConfig.ssoSessionTimeout}
                    onChange={(e) => setKioskConfig({
                      ...kioskConfig,
                      ssoSessionTimeout: parseInt(e.target.value) || 480
                    })}
                    placeholder="480"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto-login on device startup</Label>
                  <Switch
                    checked={kioskConfig.autoLogin}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      autoLogin: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Remember user sessions</Label>
                  <Switch
                    checked={kioskConfig.rememberSessions}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      rememberSessions: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Force logout on app exit</Label>
                  <Switch
                    checked={kioskConfig.forceLogoutOnExit}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      forceLogoutOnExit: checked
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Backup Apps (fallback if primary app fails)</Label>
            <Textarea
              value={kioskConfig.allowedApps.join('\n')}
              onChange={(e) => setKioskConfig({
                ...kioskConfig,
                allowedApps: e.target.value.split('\n').filter(app => app.trim())
              })}
              placeholder="com.company.backup1&#10;com.company.backup2"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Optional backup applications</p>
          </div>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Device Control Rules</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
              Enable or disable device features and connectivity options
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wifi className="text-blue-500" size={20} />
                    <div>
                      <Label className="font-medium">WiFi</Label>
                      <p className="text-xs text-gray-500">Wireless connectivity</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.wifiEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      wifiEnabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="text-green-500" size={20} />
                    <div>
                      <Label className="font-medium">Mobile Data</Label>
                      <p className="text-xs text-gray-500">Cellular connectivity</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.mobileDataEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      mobileDataEnabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-red-500" size={20} />
                    <div>
                      <Label className="font-medium">GPS Location</Label>
                      <p className="text-xs text-gray-500">Location services</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.gpsEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      gpsEnabled: checked
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500 text-lg">📶</span>
                    <div>
                      <Label className="font-medium">Bluetooth</Label>
                      <p className="text-xs text-gray-500">Short-range wireless</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.bluetoothEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      bluetoothEnabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-500 text-lg">📷</span>
                    <div>
                      <Label className="font-medium">Camera</Label>
                      <p className="text-xs text-gray-500">Photo/video capture</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.cameraEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      cameraEnabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-500 text-lg">🎤</span>
                    <div>
                      <Label className="font-medium">Microphone</Label>
                      <p className="text-xs text-gray-500">Audio recording</p>
                    </div>
                  </div>
                  <Switch
                    checked={kioskConfig.microphoneEnabled}
                    onCheckedChange={(checked) => setKioskConfig({
                      ...kioskConfig,
                      microphoneEnabled: checked
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-3">Legacy Feature Restrictions</h5>
            <div className="space-y-3">
              {[
                { key: "usb", label: "USB Access", icon: "🔌" },
                { key: "downloads", label: "File Downloads", icon: "⬇️" },
                { key: "screenshots", label: "Screenshots", icon: "📸" },
                { key: "screen_record", label: "Screen Recording", icon: "🎬" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{feature.icon}</span>
                    <Label>{feature.label}</Label>
                  </div>
                  <Switch
                    checked={kioskConfig.restrictedFeatures.includes(feature.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setKioskConfig({
                          ...kioskConfig,
                          restrictedFeatures: [...kioskConfig.restrictedFeatures, feature.key]
                        });
                      } else {
                        setKioskConfig({
                          ...kioskConfig,
                          restrictedFeatures: kioskConfig.restrictedFeatures.filter(f => f !== feature.key)
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Exit Password</Label>
              <Input
                type="password"
                value={kioskConfig.exitPassword}
                onChange={(e) => setKioskConfig({
                  ...kioskConfig,
                  exitPassword: e.target.value
                })}
                placeholder="Enter exit password"
              />
            </div>
            <div>
              <Label>Screen Timeout (seconds)</Label>
              <Input
                type="number"
                value={kioskConfig.screenTimeout}
                onChange={(e) => setKioskConfig({
                  ...kioskConfig,
                  screenTimeout: parseInt(e.target.value) || 300
                })}
                placeholder="300"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 size={16} />
                <Label>Allow Volume Control</Label>
              </div>
              <Switch
                checked={kioskConfig.volumeControl}
                onCheckedChange={(checked) => setKioskConfig({
                  ...kioskConfig,
                  volumeControl: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi size={16} />
                <Label>Allow WiFi Settings</Label>
              </div>
              <Switch
                checked={kioskConfig.wifiSettings}
                onCheckedChange={(checked) => setKioskConfig({
                  ...kioskConfig,
                  wifiSettings: checked
                })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Kiosk Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure and manage devices in kiosk mode for dedicated applications
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Device List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor size={20} />
                      <span>Devices</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : kioskDevices.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No devices found</p>
                      ) : (
                        kioskDevices.map((device) => (
                          <DeviceCard key={device.id} device={device} />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration Panel */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    {selectedDevice ? (
                      <KioskConfigPanel device={selectedDevice} />
                    ) : (
                      <div className="text-center py-12">
                        <Monitor className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Select a Device
                        </h3>
                        <p className="text-gray-500">
                          Choose a device from the list to configure kiosk settings
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4"
                onClick={() => {
                  const controls = {
                    wifi: kioskConfig.wifiEnabled,
                    mobile_data: kioskConfig.mobileDataEnabled,
                    gps: kioskConfig.gpsEnabled,
                    bluetooth: kioskConfig.bluetoothEnabled
                  };
                  const deviceIds = kioskDevices.map(d => d.id);
                  bulkControlMutation.mutate({ deviceIds, controls });
                }}
                disabled={bulkControlMutation.isPending}
              >
                <div className="text-center">
                  <Settings className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-medium">Apply Rules</div>
                  <div className="text-xs text-gray-500">Bulk device controls</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-4">
                <div className="text-center">
                  <QrCode className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-medium">Generate QR</div>
                  <div className="text-xs text-gray-500">SSO enrollment</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-4">
                <div className="text-center">
                  <Download className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-medium">Export Config</div>
                  <div className="text-xs text-gray-500">Download SSO settings</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-4">
                <div className="text-center">
                  <Upload className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-medium">Import Config</div>
                  <div className="text-xs text-gray-500">Upload SSO config</div>
                </div>
              </Button>
            </div>

            {/* Device Control Dashboard */}
            {selectedDevice && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Device Control Dashboard - {selectedDevice.name}</span>
                      <Badge variant="outline">{selectedDevice.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'wifi', label: 'WiFi', icon: Wifi, enabled: kioskConfig.wifiEnabled },
                        { key: 'mobile_data', label: 'Mobile Data', icon: Smartphone, enabled: kioskConfig.mobileDataEnabled },
                        { key: 'gps', label: 'GPS', icon: MapPin, enabled: kioskConfig.gpsEnabled },
                        { key: 'bluetooth', label: 'Bluetooth', icon: Settings, enabled: kioskConfig.bluetoothEnabled },
                      ].map((control) => (
                        <Button
                          key={control.key}
                          variant={control.enabled ? "default" : "outline"}
                          className={`h-auto py-4 ${control.enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}
                          onClick={() => {
                            const newEnabled = !control.enabled;
                            deviceControlMutation.mutate({
                              deviceId: selectedDevice.id,
                              action: control.key,
                              enabled: newEnabled
                            });
                            // Update local state
                            if (control.key === 'wifi') setKioskConfig(prev => ({ ...prev, wifiEnabled: newEnabled }));
                            if (control.key === 'mobile_data') setKioskConfig(prev => ({ ...prev, mobileDataEnabled: newEnabled }));
                            if (control.key === 'gps') setKioskConfig(prev => ({ ...prev, gpsEnabled: newEnabled }));
                            if (control.key === 'bluetooth') setKioskConfig(prev => ({ ...prev, bluetoothEnabled: newEnabled }));
                          }}
                          disabled={deviceControlMutation.isPending}
                        >
                          <div className="text-center">
                            <control.icon className="mx-auto mb-2" size={24} />
                            <div className="text-sm font-medium">{control.label}</div>
                            <div className="text-xs opacity-75">
                              {control.enabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Hidden Kiosk Admin Unlock (activated by 6 taps) */}
      <KioskAdminUnlock
        isOpen={showUnlock}
        onUnlock={handleUnlock}
        onCancel={handleCancel}
      />
    </div>
  );
}