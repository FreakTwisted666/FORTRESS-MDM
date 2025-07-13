import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText } from "lucide-react";
import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { DeviceTable } from "@/components/mdm/device-table";
import { ChatWidget } from "@/components/mdm/chat-widget";
import { EnrollmentModal } from "@/components/mdm/enrollment-modal";
import { BulkEnrollment } from "@/components/mdm/bulk-enrollment";

export default function Devices() {
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [bulkEnrollmentOpen, setBulkEnrollmentOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Device Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and monitor all enterprise devices
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setEnrollmentModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Enroll Device</span>
                </Button>
                <Button 
                  onClick={() => setBulkEnrollmentOpen(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Users size={16} />
                  <span>Bulk Enrollment</span>
                </Button>
              </div>
            </div>
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
      
      <BulkEnrollment
        open={bulkEnrollmentOpen}
        onOpenChange={setBulkEnrollmentOpen}
      />
    </div>
  );
}