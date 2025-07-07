import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, FileText } from "lucide-react";
import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { StatsCards } from "@/components/mdm/stats-cards";
import { DeviceTable } from "@/components/mdm/device-table";
import { ChatWidget } from "@/components/mdm/chat-widget";
import { EnrollmentModal } from "@/components/mdm/enrollment-modal";

export default function Dashboard() {
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <div className="p-6">
          <div className="mb-6">
            <StatsCards />
          </div>
          
          {/* Quick Actions */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="flex items-center space-x-3 h-12 bg-primary/10 hover:bg-primary/20 text-primary"
                    variant="ghost"
                    onClick={() => setEnrollmentModalOpen(true)}
                  >
                    <Plus size={20} />
                    <span>Enroll Device</span>
                  </Button>
                  <Button 
                    className="flex items-center space-x-3 h-12 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400"
                    variant="ghost"
                  >
                    <BarChart size={20} />
                    <span>Bulk Actions</span>
                  </Button>
                  <Button 
                    className="flex items-center space-x-3 h-12 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400"
                    variant="ghost"
                  >
                    <FileText size={20} />
                    <span>Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Device Table */}
          <DeviceTable />
        </div>
        
        <ChatWidget />
      </div>
      
      <EnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
      />
    </div>
  );
}
