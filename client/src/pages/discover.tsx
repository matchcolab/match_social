import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Users, TrendingUp, Heart, MessageCircle } from "lucide-react";

export default function Discover() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onlineCount } = useWebSocket(user?.id);

  // Redirect to login if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading discovery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Compass className="mr-3 h-8 w-8 text-primary" />
                Discover
              </h1>
              <p className="text-secondary text-lg">
                Find new connections, trending discussions, and interesting people
              </p>
            </div>

            <div className="grid gap-6">
              {/* Trending Today */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trending Today
                  </CardTitle>
                  <CardDescription>Popular discussions in your community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">Weekend adventure planning</h3>
                      <Badge variant="secondary">Hot</Badge>
                    </div>
                    <p className="text-sm text-secondary mb-3">
                      Community members are sharing their favorite weekend activities...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-secondary">
                      <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />47 likes</span>
                      <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />23 comments</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">Book recommendations for spring</h3>
                      <Badge variant="secondary">Popular</Badge>
                    </div>
                    <p className="text-sm text-secondary mb-3">
                      Great reading suggestions from the Book Club community...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-secondary">
                      <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />32 likes</span>
                      <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />18 comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggested People */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    People You Might Like
                  </CardTitle>
                  <CardDescription>Based on your interests and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-secondary">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">Complete your profile to get personalized suggestions</p>
                    <Button onClick={() => window.location.href = '/profile'}>
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Groups */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Groups</CardTitle>
                  <CardDescription>Communities with recent activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Weekend Warriors</h4>
                      <p className="text-sm text-secondary">Adventure and outdoor activities</p>
                    </div>
                    <Button size="sm" variant="outline">Join</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Foodie Friends</h4>
                      <p className="text-sm text-secondary">Culinary adventures and recipes</p>
                    </div>
                    <Button size="sm" variant="outline">Join</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Creative Minds</h4>
                      <p className="text-sm text-secondary">Artists, writers, and makers</p>
                    </div>
                    <Button size="sm" variant="outline">Join</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <RightSidebar userId={user.id} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}