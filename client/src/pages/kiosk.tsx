
import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { KioskManagement } from "@/components/mdm/kiosk-management";

export default function Kiosk() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <div className="p-6">
          <KioskManagement />
        </div>
      </div>
    </div>
  );
}
