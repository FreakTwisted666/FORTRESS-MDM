import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { PolicyManagement } from "@/components/mdm/policy-management";

export default function Policies() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <div className="p-6">
          <PolicyManagement />
        </div>
      </div>
    </div>
  );
}