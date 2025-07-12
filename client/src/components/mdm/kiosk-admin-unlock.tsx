import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface KioskAdminUnlockProps {
  onUnlock: (password: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function KioskAdminUnlock({ onUnlock, onCancel, isOpen }: KioskAdminUnlockProps) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (attempts >= 3) {
      setIsLocked(true);
      toast({
        title: 'Too Many Attempts',
        description: 'Admin unlock disabled for 5 minutes due to failed attempts',
        variant: 'destructive',
      });
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 5 * 60 * 1000); // 5 minutes
    }
  }, [attempts, toast]);

  const handleUnlock = () => {
    if (isLocked) {
      toast({
        title: 'Admin Unlock Disabled',
        description: 'Too many failed attempts. Please wait before trying again.',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Password Required',
        description: 'Please enter the admin password',
        variant: 'destructive',
      });
      return;
    }

    // Simulate password validation (in production, this would validate against server)
    if (password === 'admin123') {
      onUnlock(password);
      setPassword('');
      setAttempts(0);
      toast({
        title: 'Kiosk Mode Unlocked',
        description: 'Admin access granted. Exiting kiosk mode.',
      });
    } else {
      setAttempts(prev => prev + 1);
      setPassword('');
      toast({
        title: 'Invalid Password',
        description: `Incorrect admin password. ${3 - attempts - 1} attempts remaining.`,
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Admin Unlock Required
          </DialogTitle>
          <DialogDescription>
            This device is in kiosk mode. Enter admin password to unlock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Kiosk Mode Active
              </CardTitle>
              <CardDescription>
                Device is restricted to approved applications only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                To exit kiosk mode and gain full device access, you must provide the administrator password.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="adminPassword">Administrator Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                disabled={isLocked}
              />
            </div>

            {attempts > 0 && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {attempts} failed attempt{attempts > 1 ? 's' : ''}. 
                {attempts >= 3 ? ' Admin unlock disabled for 5 minutes.' : ` ${3 - attempts} remaining.`}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              className="flex-1"
              disabled={isLocked}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for detecting 6x tap to show admin unlock
export function useKioskAdminUnlock() {
  const [tapCount, setTapCount] = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTap = () => {
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }

      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);

      if (newTapCount === 6) {
        setShowUnlock(true);
        setTapCount(0);
        return;
      }

      // Reset tap count after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        setTapCount(0);
      }, 2000);
      setTapTimeout(timeout);
    };

    // Add event listener for screen taps
    document.addEventListener('click', handleTap);
    document.addEventListener('touchstart', handleTap);

    return () => {
      document.removeEventListener('click', handleTap);
      document.removeEventListener('touchstart', handleTap);
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    };
  }, [tapCount, tapTimeout]);

  const handleUnlock = (password: string) => {
    // Validate password and exit kiosk mode
    console.log('Unlocking with password:', password);
    setShowUnlock(false);
    // In production, this would send command to exit kiosk mode
  };

  const handleCancel = () => {
    setShowUnlock(false);
    setTapCount(0);
  };

  return {
    showUnlock,
    tapCount,
    handleUnlock,
    handleCancel,
  };
}