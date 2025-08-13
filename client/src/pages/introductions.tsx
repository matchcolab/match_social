import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Clock, CheckCircle, XCircle, User } from "lucide-react";
import type { Introduction, User as UserType } from "@shared/schema";

export default function Introductions() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onlineCount } = useWebSocket(user?.id);
  const queryClient = useQueryClient();

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

  const { data: introductions = [] } = useQuery<(Introduction & { requester: UserType; target: UserType })[]>({
    queryKey: ["/api/introductions"],
    enabled: isAuthenticated && !!user,
  });

  const updateIntroductionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'declined' }) => {
      return apiRequest(`/api/introductions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/introductions"] });
      toast({
        title: "Introduction Updated",
        description: "Status changed successfully",
      });
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading introductions...</p>
        </div>
      </div>
    );
  }

  const pendingIntroductions = introductions.filter(intro => intro.status === 'pending');
  const acceptedIntroductions = introductions.filter(intro => intro.status === 'accepted');
  const sentIntroductions = introductions.filter(intro => intro.requesterId === user.id);

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} user={user} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 xl:pl-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Handshake className="mr-3 h-8 w-8 text-primary" />
                Introductions
              </h1>
              <p className="text-secondary text-lg">
                Manage your connection requests and build meaningful relationships
              </p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending ({pendingIntroductions.length})</span>
                </TabsTrigger>
                <TabsTrigger value="accepted" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Connections ({acceptedIntroductions.length})</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Sent ({sentIntroductions.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Introduction Requests</CardTitle>
                    <CardDescription>
                      People who would like to connect with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingIntroductions.length > 0 ? (
                      <div className="space-y-4">
                        {pendingIntroductions.map((intro) => (
                          <div key={intro.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={intro.requester.profileImageUrl || ""} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(intro.requester.firstName, intro.requester.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold">
                                    {intro.requester.firstName} {intro.requester.lastName}
                                  </h3>
                                  <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-sm text-secondary mb-3">
                                  {intro.message || "Would like to connect with you."}
                                </p>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => updateIntroductionMutation.mutate({
                                      id: intro.id,
                                      status: 'accepted'
                                    })}
                                    disabled={updateIntroductionMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateIntroductionMutation.mutate({
                                      id: intro.id,
                                      status: 'declined'
                                    })}
                                    disabled={updateIntroductionMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-secondary">
                        <Handshake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending introduction requests</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Connections</CardTitle>
                    <CardDescription>
                      People you've connected with through introductions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {acceptedIntroductions.length > 0 ? (
                      <div className="grid gap-4">
                        {acceptedIntroductions.map((intro) => (
                          <div key={intro.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={intro.requester.profileImageUrl || ""} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(intro.requester.firstName, intro.requester.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    {intro.requester.firstName} {intro.requester.lastName}
                                  </h3>
                                  <Badge variant="secondary">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Connected
                                  </Badge>
                                </div>
                                <p className="text-sm text-secondary">
                                  Connected on {new Date(intro.createdAt!).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-secondary">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No connections yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sent" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sent Requests</CardTitle>
                    <CardDescription>
                      Introduction requests you've sent to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentIntroductions.length > 0 ? (
                      <div className="space-y-4">
                        {sentIntroductions.map((intro) => (
                          <div key={intro.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={intro.target.profileImageUrl || ""} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(intro.target.firstName, intro.target.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    {intro.target.firstName} {intro.target.lastName}
                                  </h3>
                                  <Badge 
                                    variant={intro.status === 'accepted' ? 'default' : 
                                            intro.status === 'declined' ? 'destructive' : 'outline'}
                                  >
                                    {intro.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                    {intro.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {intro.status === 'declined' && <XCircle className="w-3 h-3 mr-1" />}
                                    {intro.status.charAt(0).toUpperCase() + intro.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-secondary">
                                  Sent on {new Date(intro.createdAt!).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-secondary">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No introduction requests sent</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/discover'}>
                          Discover People
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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