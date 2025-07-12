import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Lock, RotateCcw, Eye, Trash2, MonitorSmartphone, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WipeModal } from "./wipe-modal";
import { EnrollmentModal } from "./enrollment-modal";
import { EmergencyActionsButton } from "./emergency-actions";
import { apiRequest } from "@/lib/queryClient";
import type { Device } from "@shared/schema";

export function DeviceTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ["/api/devices"],
  });

  const commandMutation = useMutation({
    mutationFn: async ({ deviceId, command }: { deviceId: number; command: string }) => {
      await apiRequest("POST", `/api/devices/${deviceId}/commands`, {
        command,
        issuedBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Command sent",
        description: "Device command has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredDevices = devices?.filter((device: Device) =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCommand = (device: Device, command: string) => {
    if (device.status === "offline" && command !== "wipe") {
      toast({
        title: "Device Offline",
        description: "Cannot send command to offline device.",
        variant: "destructive",
      });
      return;
    }

    if (command === "wipe") {
      setSelectedDevice(device);
      setWipeModalOpen(true);
    } else {
      commandMutation.mutate({ deviceId: device.id, command });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Online</Badge>;
      case "offline":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Offline</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Warning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (minutes < 24 * 60) {
      return `${Math.floor(minutes / 60)} hours ago`;
    } else {
      return `${Math.floor(minutes / (24 * 60))} days ago`;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Device Management</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => refetch()}
                disabled={isLoading}
                variant="outline"
              >
                <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16">
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device: Device) => (
                  <TableRow key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <MonitorSmartphone className="text-gray-600 dark:text-gray-400" size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-gray-500">
                            {device.imei ? `IMEI: ${device.imei}` : `Serial: ${device.serialNumber}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(device.status)}
                    </TableCell>
                    <TableCell>
                      {formatLastSeen(device.lastSeen?.toString() || "")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getBatteryColor(device.batteryLevel || 0)}`}
                            style={{ width: `${device.batteryLevel || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{device.batteryLevel || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{device.location || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommand(device, "lock")}
                          disabled={device.status === "offline" || commandMutation.isPending}
                          title="Lock Device"
                        >
                          <Lock size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommand(device, "reboot")}
                          disabled={device.status === "offline" || commandMutation.isPending}
                          title="Reboot Device"
                        >
                          <RotateCcw size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommand(device, "wipe")}
                          disabled={commandMutation.isPending}
                          title="Wipe Device"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <EmergencyActionsButton device={device} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WipeModal
        open={wipeModalOpen}
        onOpenChange={setWipeModalOpen}
        device={selectedDevice}
        onConfirm={(device) => {
          if (device) {
            commandMutation.mutate({ deviceId: device.id, command: "wipe" });
          }
          setWipeModalOpen(false);
          setSelectedDevice(null);
        }}
      />

      <EnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
      />
    </>
  );
}
