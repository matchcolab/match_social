import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Groups from "@/pages/groups";
import Introductions from "@/pages/introductions";
import Discover from "@/pages/discover";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Signup from "@/pages/signup";
import SocialProfile from "@/pages/onboarding/social-profile";
import OnboardingProgress from "@/pages/onboarding/progress";
import OnboardingFlow from "@/pages/onboarding/onboarding-flow";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={OnboardingFlow} />
      <Route path="/onboarding/social-profile" component={SocialProfile} />
      <Route path="/onboarding/progress" component={OnboardingProgress} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/groups" component={Groups} />
          <Route path="/introductions" component={Introductions} />
          <Route path="/discover" component={Discover} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
