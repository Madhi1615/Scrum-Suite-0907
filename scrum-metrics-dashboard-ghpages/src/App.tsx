import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TeamHealth from "@/pages/team-health";
import SprintVelocity from "@/pages/sprint-velocity";
import Retrospective from "@/pages/retrospective";
import TeamConfig from "@/pages/team-config";
import ThresholdConfig from "@/pages/threshold-config";
import Analytics from "@/pages/analytics";
import Layout from "@/components/layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/team-health" component={TeamHealth} />
          <Route path="/velocity" component={SprintVelocity} />
          <Route path="/retrospective" component={Retrospective} />
          <Route path="/team-config" component={TeamConfig} />
          <Route path="/threshold-config" component={ThresholdConfig} />
          <Route path="/analytics" component={Analytics} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
