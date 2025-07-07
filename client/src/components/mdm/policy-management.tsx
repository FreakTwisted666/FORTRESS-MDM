import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Bluetooth, Camera, Lock, Phone, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Policy {
  id: number;
  name: string;
  description: string;
  settings: {
    wifi: boolean;
    bluetooth: boolean;
    camera: boolean;
    usb: boolean;
    microphone: boolean;
    location: boolean;
    screenCapture: boolean;
    appInstall: boolean;
    webFiltering: boolean;
    callRestrictions: boolean;
  };
  enforcementLevel: "strict" | "moderate" | "flexible";
  appliedDevices: number;
  createdAt: Date;
}

export function PolicyManagement() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock policies data - in real app this would come from API
  const mockPolicies: Policy[] = [
    {
      id: 1,
      name: "High Security - Enterprise",
      description: "Maximum security for corporate devices",
      settings: {
        wifi: true,
        bluetooth: false,
        camera: false,
        usb: false,
        microphone: false,
        location: true,
        screenCapture: false,
        appInstall: false,
        webFiltering: true,
        callRestrictions: true,
      },
      enforcementLevel: "strict",
      appliedDevices: 45,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Standard - BYOD",
      description: "Balanced security for bring-your-own devices",
      settings: {
        wifi: true,
        bluetooth: true,
        camera: true,
        usb: true,
        microphone: true,
        location: true,
        screenCapture: true,
        appInstall: true,
        webFiltering: true,
        callRestrictions: false,
      },
      enforcementLevel: "moderate",
      appliedDevices: 23,
      createdAt: new Date(),
    },
  ];

  const getEnforcementBadge = (level: string) => {
    switch (level) {
      case "strict":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Strict</Badge>;
      case "moderate":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Moderate</Badge>;
      case "flexible":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Flexible</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const PolicyCard = ({ policy }: { policy: Policy }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPolicy(policy)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="text-primary" size={20} />
            </div>
            <div>
              <CardTitle className="text-lg">{policy.name}</CardTitle>
              <p className="text-sm text-gray-500">{policy.description}</p>
            </div>
          </div>
          {getEnforcementBadge(policy.enforcementLevel)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Applied to {policy.appliedDevices} devices</span>
          <span className="text-gray-500">
            {policy.createdAt.toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const PolicySettings = ({ policy }: { policy: Policy }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(policy.settings).map(([key, value]) => {
          const icons = {
            wifi: Wifi,
            bluetooth: Bluetooth,
            camera: Camera,
            usb: FileText,
            microphone: Phone,
            location: Shield,
            screenCapture: Camera,
            appInstall: Shield,
            webFiltering: Shield,
            callRestrictions: Phone,
          };
          
          const Icon = icons[key as keyof typeof icons] || Shield;
          
          return (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon size={20} className="text-gray-600" />
                <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
              </div>
              <Switch checked={value} disabled />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage device security policies</p>
        </div>
        <Button>
          <Shield className="mr-2" size={16} />
          Create Policy
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Policy List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPolicy?.id === policy.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{policy.name}</h3>
                    {getEnforcementBadge(policy.enforcementLevel)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {policy.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {policy.appliedDevices} devices
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Policy Details */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPolicy.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPolicy.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEnforcementBadge(selectedPolicy.enforcementLevel)}
                    <Button variant="outline" size="sm">
                      Edit Policy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="settings" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="devices">Applied Devices</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="settings">
                    <PolicySettings policy={selectedPolicy} />
                  </TabsContent>
                  
                  <TabsContent value="devices">
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Device list for policy "{selectedPolicy.name}" would be shown here
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics">
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Policy compliance analytics would be shown here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Shield className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Policy
                  </h3>
                  <p className="text-gray-500">
                    Choose a policy from the list to view its details and settings
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}