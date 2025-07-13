import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollmentModal({ open, onOpenChange }: EnrollmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    imei: "",
    serialNumber: "",
    deviceType: "",
    enrollmentMethod: "qr",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/devices", {
        name: data.name,
        imei: data.imei || undefined,
        serialNumber: data.serialNumber || undefined,
        deviceType: data.deviceType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Device enrolled",
        description: "Device has been successfully enrolled.",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        imei: "",
        serialNumber: "",
        deviceType: "",
        enrollmentMethod: "qr",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deviceType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    enrollMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll New Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter device name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI</Label>
            <Input
              id="imei"
              value={formData.imei}
              onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
              placeholder="Enter IMEI (15 digits)"
              maxLength={15}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serial">Serial Number</Label>
            <Input
              id="serial"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Enter serial number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type *</Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="enrollmentMethod">Enrollment Method</Label>
            <Select
              value={formData.enrollmentMethod}
              onValueChange={(value) => setFormData({ ...formData, enrollmentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qr">QR Code</SelectItem>
                <SelectItem value="manual">Manual Setup</SelectItem>
                <SelectItem value="zero-touch">Zero Touch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <QrCode className="text-blue-600 dark:text-blue-400" size={20} />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  QR Code will be generated with enrollment credentials
                </p>
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? "Enrolling..." : "Enroll Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
