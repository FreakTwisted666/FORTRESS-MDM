import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Applications from "@/pages/applications";
import Policies from "@/pages/policies";
import Analytics from "@/pages/analytics";
import Kiosk from "@/pages/kiosk";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/applications" component={isAuthenticated ? Applications : Landing} />
      <Route path="/policies" component={isAuthenticated ? Policies : Landing} />
      <Route path="/analytics" component={isAuthenticated ? Analytics : Landing} />
      <Route path="/kiosk" component={isAuthenticated ? Kiosk : Landing} />
      <Route path="/devices" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/users" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/alerts" component={isAuthenticated ? Dashboard : Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fortress-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
