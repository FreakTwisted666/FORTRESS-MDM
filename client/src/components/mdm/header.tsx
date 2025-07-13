import { useState } from "react";
import { Moon, Sun, Bell, User, Settings, LogOut, Shield, AlertTriangle } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mock notification data - in real app this would come from API
  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "Device Policy Violation",
      message: "Samsung Galaxy Tab A8 has disabled WiFi against policy",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      title: "New Device Enrolled",
      message: "iPhone 15 Pro has been successfully enrolled",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "success",
      title: "Security Update Complete",
      message: "All Android devices updated to latest security patch",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="text-orange-500" size={16} />;
      case "info":
        return <Bell className="text-blue-500" size={16} />;
      case "success":
        return <Shield className="text-green-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Device Management Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your enterprise devices
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
          {/* Notifications */}
          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.unread 
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                          : "bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
                <Avatar>
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName || user?.id} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'Administrator'}
                  </p>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName || user?.id} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'Administrator'}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                </div>
                <Separator />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
