import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { Device } from "@shared/schema";

interface WipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onConfirm: (device: Device | null) => void;
}

export function WipeModal({ open, onOpenChange, device, onConfirm }: WipeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <span>Confirm Device Wipe</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to wipe <strong>{device?.name}</strong>?
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  This action is irreversible!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  All data on this device will be permanently deleted and the device will be factory reset.
                </p>
              </div>
            </div>
          </div>
          
          {device && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Device Details:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {device.name}</p>
                <p><strong>IMEI:</strong> {device.imei || "N/A"}</p>
                <p><strong>Serial:</strong> {device.serialNumber || "N/A"}</p>
                <p><strong>Status:</strong> {device.status}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(device)}
          >
            Wipe Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
