import React, { useState } from 'react';
import { AlertTriangle, Lock, Trash2, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Device } from '@shared/schema';

interface EmergencyActionsProps {
  device: Device;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyActions({ device, isOpen, onOpenChange }: EmergencyActionsProps) {
  const [confirmAction, setConfirmAction] = useState<'lock' | 'wipe' | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const emergencyMutation = useMutation({
    mutationFn: async ({ action, password, reason }: { action: 'lock' | 'wipe', password: string, reason: string }) => {
      await apiRequest(`/api/devices/${device.id}/emergency`, {
        method: 'POST',
        body: JSON.stringify({ action, adminPassword: password, reason }),
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: 'Emergency Action Executed',
        description: `Device ${action} command sent successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      onOpenChange(false);
      setConfirmAction(null);
      setAdminPassword('');
      setReason('');
    },
    onError: (error) => {
      toast({
        title: 'Emergency Action Failed',
        description: error.message || 'Failed to execute emergency action',
        variant: 'destructive',
      });
    },
  });

  const handleEmergencyAction = (action: 'lock' | 'wipe') => {
    if (!adminPassword) {
      toast({
        title: 'Admin Password Required',
        description: 'Please enter your admin password to proceed',
        variant: 'destructive',
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for this emergency action',
        variant: 'destructive',
      });
      return;
    }

    emergencyMutation.mutate({ action, password: adminPassword, reason });
  };

  const getLastSeen = (device: Device) => {
    if (!device.lastSeen) return 'Never';
    const now = new Date();
    const lastSeen = new Date(device.lastSeen);
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Device Actions
          </DialogTitle>
          <DialogDescription>
            Execute emergency security actions on this device. These actions are immediate and irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Device Name</span>
                <span className="font-medium">{device.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">IMEI</span>
                <span className="font-mono text-sm">{device.imei}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                  {device.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Seen</span>
                <span className="text-sm">{getLastSeen(device)}</span>
              </div>
            </CardContent>
          </Card>

          {!confirmAction ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select an emergency action to execute:
              </div>

              {/* Emergency Lock */}
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-500" />
                    Emergency Lock
                  </CardTitle>
                  <CardDescription>
                    Immediately lock the device screen and prevent access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setConfirmAction('lock')}
                    variant="outline"
                    className="w-full border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    Lock Device
                  </Button>
                </CardContent>
              </Card>

              {/* Emergency Wipe */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    Emergency Wipe
                  </CardTitle>
                  <CardDescription>
                    Perform factory reset and erase all data on the device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setConfirmAction('wipe')}
                    variant="outline"
                    className="w-full border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Wipe Device
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">
                    Confirm {confirmAction === 'lock' ? 'Emergency Lock' : 'Emergency Wipe'}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300">
                    {confirmAction === 'lock' 
                      ? 'This will immediately lock the device screen'
                      : 'This will permanently erase all data on the device'
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Emergency Action</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for this emergency action..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setConfirmAction(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEmergencyAction(confirmAction)}
                  variant="destructive"
                  className="flex-1"
                  disabled={emergencyMutation.isPending}
                >
                  {emergencyMutation.isPending ? 'Executing...' : `${confirmAction === 'lock' ? 'Lock' : 'Wipe'} Device`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EmergencyActionsButton({ device }: { device: Device }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Shield className="h-4 w-4 mr-2" />
        Emergency
      </Button>
      <EmergencyActions device={device} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}