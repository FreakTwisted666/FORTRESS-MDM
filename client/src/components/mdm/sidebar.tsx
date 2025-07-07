import { Shield, BarChart3, MonitorSmartphone, Users, Settings, Bell, AppWindow, Monitor } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: BarChart3, href: "/" },
  { name: "Devices", icon: MonitorSmartphone, href: "/devices" },
  { name: "Applications", icon: AppWindow, href: "/applications" },
  { name: "Kiosk", icon: Monitor, href: "/kiosk" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Policies", icon: Settings, href: "/policies" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Alerts", icon: Bell, href: "/alerts" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg fixed h-full z-10">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fortress MDM</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise Edition</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href === "/" && location === "/dashboard");

          return (
            <Link key={item.name} href={item.href}>
              <button
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}