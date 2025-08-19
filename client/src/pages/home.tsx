import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import DailyPrompt from "@/components/daily-prompt";
import ResponsesFeed from "@/components/responses-feed";
import GroupDiscovery from "@/components/group-discovery";
import IntroductionModal from "@/components/modals/introduction-modal";
import ActivityFeedHome from "@/components/activity-feed-home";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onlineCount } = useWebSocket(user?.id);

  // Redirect to login if not authenticated or handle onboarding flow
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Check onboarding status and redirect if incomplete
    if (user && isAuthenticated) {
      const status = (user as any).onboardingStatus;
      
      if (status === 'account_created') {
        window.location.href = '/onboarding/social-profile';
        return;
      } else if (status === 'social_profile_completed') {
        window.location.href = '/onboarding/progress';
        return;
      } else if (!status || status === 'not_started') {
        window.location.href = '/onboarding/progress';
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading your community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} user={user} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 xl:pl-64">
          <div className="max-w-4xl mx-auto">
            {/* Daily Prompt Section */}
            <DailyPrompt user={user} />

            {/* Admin Community Activities */}
            <ActivityFeedHome />

            {/* Community Responses Feed */}
            <ResponsesFeed userId={user.id} />

            {/* Group Discovery */}
            <GroupDiscovery userId={user.id} />
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <RightSidebar userId={user.id} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Introduction Request Modal */}
      <IntroductionModal />
    </div>
  );
}
