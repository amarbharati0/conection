import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CandidateList from "@/pages/CandidateList";
import CandidateDetails from "@/pages/CandidateDetails";
import CandidateDashboard from "@/pages/CandidateDashboard";
import AttendancePage from "@/pages/AttendancePage";

function ProtectedRoute({ 
  component: Component, 
  allowedRole 
}: { 
  component: React.ComponentType, 
  allowedRole?: "admin" | "candidate" 
}) {
  const { user } = useAuth();

  // If no user, redirect to auth
  if (!user) return <Redirect to="/auth" />;

  // If role is restricted and user doesn't match
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their appropriate dashboard
    return <Redirect to={user.role === "admin" ? "/admin" : "/dashboard"} />;
  }

  return <Component />;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/auth" />;
  return <Redirect to={user.role === "admin" ? "/admin" : "/dashboard"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRole="admin" />
      </Route>
      <Route path="/admin/candidates">
        <ProtectedRoute component={CandidateList} allowedRole="admin" />
      </Route>
      <Route path="/admin/candidates/:id">
        <ProtectedRoute component={CandidateDetails} allowedRole="admin" />
      </Route>

      {/* Candidate Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={CandidateDashboard} allowedRole="candidate" />
      </Route>
      <Route path="/attendance">
        <ProtectedRoute component={AttendancePage} allowedRole="candidate" />
      </Route>

      {/* Root Redirect */}
      <Route path="/" component={RootRedirect} />

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
