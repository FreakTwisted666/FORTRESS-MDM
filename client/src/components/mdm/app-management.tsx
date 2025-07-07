import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AppWindow, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Plus,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface App {
  id: number;
  name: string;
  packageName: string;
  version: string;
  category: string;
  status: "approved" | "blocked" | "pending";
  installCount: number;
  size: string;
  developer: string;
  lastUpdated: Date;
  description: string;
}

export function AppManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();

  // Mock apps data - in real app this would come from API
  const mockApps: App[] = [
    {
      id: 1,
      name: "Microsoft Teams",
      packageName: "com.microsoft.teams",
      version: "1416/1.0.0.2023149403",
      category: "Communication",
      status: "approved",
      installCount: 45,
      size: "125 MB",
      developer: "Microsoft Corporation",
      lastUpdated: new Date("2024-01-15"),
      description: "Microsoft Teams for collaboration and communication",
    },
    {
      id: 2,
      name: "Chrome Browser",
      packageName: "com.android.chrome",
      version: "119.0.6045.193",
      category: "Browser",
      status: "approved",
      installCount: 67,
      size: "89 MB",
      developer: "Google LLC",
      lastUpdated: new Date("2024-01-10"),
      description: "Google Chrome web browser",
    },
    {
      id: 3,
      name: "TikTok",
      packageName: "com.ss.android.ugc.tiktok",
      version: "32.5.4",
      category: "Social",
      status: "blocked",
      installCount: 0,
      size: "156 MB",
      developer: "TikTok Pte. Ltd.",
      lastUpdated: new Date("2024-01-05"),
      description: "Social media video platform - blocked by policy",
    },
    {
      id: 4,
      name: "Slack",
      packageName: "com.slack",
      version: "23.11.20.0",
      category: "Communication",
      status: "pending",
      installCount: 12,
      size: "78 MB",
      developer: "Slack Technologies",
      lastUpdated: new Date("2024-01-12"),
      description: "Team collaboration and messaging platform",
    },
  ];

  const categories = ["all", "Communication", "Browser", "Social", "Productivity", "Security"];

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="mr-1" size={12} />
          Approved
        </Badge>;
      case "blocked":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <Shield className="mr-1" size={12} />
          Blocked
        </Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertTriangle className="mr-1" size={12} />
          Pending
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const AppUploadModal = () => (
    <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appFile">APK File</Label>
            <Input
              id="appFile"
              type="file"
              accept=".apk"
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              placeholder="Enter application name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appCategory">Category</Label>
            <Input
              id="appCategory"
              placeholder="e.g., Productivity, Security"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appDescription">Description</Label>
            <Textarea
              id="appDescription"
              placeholder="Enter application description"
              rows={3}
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600 dark:text-blue-400" size={16} />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All uploaded applications will be scanned for security vulnerabilities
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button>
              <Upload className="mr-2" size={16} />
              Upload App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and distribute applications across devices</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="mr-2" size={16} />
          Upload App
        </Button>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">App Catalog</TabsTrigger>
          <TabsTrigger value="policies">App Policies</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Application Catalog</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Installs</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <AppWindow className="text-gray-600 dark:text-gray-400" size={20} />
                          </div>
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-gray-500">{app.packageName}</div>
                            <div className="text-xs text-gray-400">v{app.version}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell>{app.installCount} devices</TableCell>
                      <TableCell>{app.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" title="Install">
                            <Download size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" title="Configure">
                            <Settings size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" title="Remove">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Shield className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  App Policies
                </h3>
                <p className="text-gray-500">
                  Configure app installation policies, blocklists, and allowlists
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Download className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  App Distribution
                </h3>
                <p className="text-gray-500">
                  Manage app deployment and updates across device groups
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppUploadModal />
    </div>
  );
}