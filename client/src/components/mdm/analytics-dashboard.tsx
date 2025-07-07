import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin
} from "lucide-react";

export function AnalyticsDashboard() {
  // Mock analytics data
  const complianceData = {
    overall: 87,
    policyViolations: 23,
    securityThreats: 5,
    deviceHealth: 92,
  };

  const deviceDistribution = [
    { os: "Android", count: 45, percentage: 67 },
    { os: "iOS", count: 18, percentage: 27 },
    { os: "Windows", count: 4, percentage: 6 },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "security",
      message: "Unauthorized app installation detected",
      device: "Samsung Galaxy Tab A8",
      timestamp: "2 hours ago",
      severity: "high",
    },
    {
      id: 2,
      type: "policy",
      message: "Device exceeded geofence boundary",
      device: "iPad Pro 11-inch",
      timestamp: "4 hours ago",
      severity: "medium",
    },
    {
      id: 3,
      type: "compliance",
      message: "Password policy violation",
      device: "Google Pixel 7",
      timestamp: "6 hours ago",
      severity: "low",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reporting</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor device compliance and security metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Compliance</p>
                <p className="text-2xl font-bold text-green-600">{complianceData.overall}%</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp size={16} className="mr-1" />
                  +2.5% vs last month
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Policy Violations</p>
                <p className="text-2xl font-bold text-red-600">{complianceData.policyViolations}</p>
                <div className="flex items-center text-sm text-red-600 mt-1">
                  <TrendingDown size={16} className="mr-1" />
                  -8 vs last week
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Threats</p>
                <p className="text-2xl font-bold text-orange-600">{complianceData.securityThreats}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock size={16} className="mr-1" />
                  Last 24 hours
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Shield className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Device Health</p>
                <p className="text-2xl font-bold text-blue-600">{complianceData.deviceHealth}%</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <TrendingUp size={16} className="mr-1" />
                  Excellent
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deviceDistribution.map((item) => (
              <div key={item.os} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.os}</span>
                  <span className="text-gray-600">{item.count} devices</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <div className="text-xs text-gray-500 text-right">
                  {item.percentage}% of total
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      {alert.type === "security" && <Shield className="text-red-600" size={20} />}
                      {alert.type === "policy" && <AlertTriangle className="text-yellow-600" size={20} />}
                      {alert.type === "compliance" && <CheckCircle className="text-blue-600" size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.device} • {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compliance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="compliance">Compliance Trends</TabsTrigger>
              <TabsTrigger value="security">Security Events</TabsTrigger>
              <TabsTrigger value="performance">Device Performance</TabsTrigger>
              <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compliance" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">Compliance trend chart would be displayed here</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <Shield className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">Security events timeline would be displayed here</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <TrendingUp className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">Device performance metrics would be displayed here</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="geolocation" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">Device location map would be displayed here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}