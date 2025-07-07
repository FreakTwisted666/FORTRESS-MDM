import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MonitorSmartphone, Wifi, AlertTriangle, Bell } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalDevices || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <MonitorSmartphone className="text-primary" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online Devices</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.onlineDevices || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Wifi className="text-green-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Policy Violations</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.policyViolations || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.criticalAlerts || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Bell className="text-red-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
