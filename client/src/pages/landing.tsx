import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Monitor, Smartphone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fortress MDM</h1>
              <p className="text-gray-600 dark:text-gray-400">Enterprise Edition</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Secure, scalable, and comprehensive mobile device management for your enterprise
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Lock className="text-primary mb-2" size={24} />
              <CardTitle>Advanced Security</CardTitle>
              <CardDescription>
                End-to-end encryption, secure enrollment, and comprehensive access controls
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Monitor className="text-primary mb-2" size={24} />
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Live device status, location tracking, and instant alerts for policy violations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Smartphone className="text-primary mb-2" size={24} />
              <CardTitle>Multi-Platform Support</CardTitle>
              <CardDescription>
                Manage Android, iOS, and Windows devices from a single unified dashboard
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>
                Sign in to access your Fortress MDM dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full">
                Sign In with Replit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
