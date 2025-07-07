import { Sidebar } from "@/components/mdm/sidebar";
import { Header } from "@/components/mdm/header";
import { AnalyticsDashboard } from "@/components/mdm/analytics-dashboard";

export default function Analytics() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <div className="p-6">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}