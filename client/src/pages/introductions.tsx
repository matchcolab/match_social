import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Handshake, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  Calendar,
  Heart
} from "lucide-react";
import type { Introduction, User } from "@shared/schema";

type IntroductionWithUsers = Introduction & {
  requester: User;
  target: User;
};

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

  const { data: introductions = [], isLoading: introductionsLoading } = useQuery<IntroductionWithUsers[]>({
    queryKey: ["/api/introductions"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ introId, status }: { introId: string; status: 'accepted' | 'declined' }) => {
      return await apiRequest("PATCH", `/api/introductions/${introId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/introductions"] });
      toast({
        title: variables.status === 'accepted' ? "Introduction accepted!" : "Introduction declined",
        description: variables.status === 'accepted' 
          ? "You can now start a conversation." 
          : "The introduction request has been declined.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update introduction status.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'declined': return XCircle;
      case 'completed': return MessageCircle;
      default: return Clock;
    }
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

  // Filter introductions by type
  const pendingIntroductions = introductions.filter(intro => intro.status === 'pending');
  const activeIntroductions = introductions.filter(intro => intro.status === 'accepted');
  const pastIntroductions = introductions.filter(intro => ['declined', 'completed'].includes(intro.status));

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Handshake className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-slate-800">Introductions</h1>
              </div>
              <p className="text-secondary">Manage your connection requests and build meaningful relationships</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{pendingIntroductions.length}</p>
                      <p className="text-sm text-secondary">Pending Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{activeIntroductions.length}</p>
                      <p className="text-sm text-secondary">Active Connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{introductions.length}</p>
                      <p className="text-sm text-secondary">Total Introductions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Introduction Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingIntroductions.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {pendingIntroductions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Pending Introductions */}
              <TabsContent value="pending" className="space-y-4">
                {introductionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : pendingIntroductions.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No pending requests</h3>
                      <p className="text-secondary">New introduction requests will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingIntroductions.map((intro) => {
                    const StatusIcon = getStatusIcon(intro.status);
                    
                    return (
                      <Card key={intro.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={intro.requester.profileImageUrl || ""} />
                              <AvatarFallback className="bg-primary text-white">
                                {getInitials(intro.requester.firstName, intro.requester.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-slate-800">
                                  {intro.requester.firstName} {intro.requester.lastName} wants to connect
                                </h3>
                                <Badge className={`text-xs border ${getStatusColor(intro.status)}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {intro.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-secondary mb-3">
                                {intro.requester.age && <span>{intro.requester.age} years old</span>}
                                {intro.requester.location && <span>• {intro.requester.location}</span>}
                                <span>• {formatTimeAgo(intro.createdAt)}</span>
                              </div>
                              
                              {intro.message && (
                                <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg border">
                                  "{intro.message}"
                                </p>
                              )}
                              
                              <div className="flex space-x-3">
                                <Button 
                                  size="sm"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    introId: intro.id, 
                                    status: 'accepted' 
                                  })}
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    introId: intro.id, 
                                    status: 'declined' 
                                  })}
                                  disabled={updateStatusMutation.isPending}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Active Introductions */}
              <TabsContent value="active" className="space-y-4">
                {activeIntroductions.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No active connections</h3>
                      <p className="text-secondary">Accepted introductions will appear here for you to start conversations.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeIntroductions.map((intro) => (
                    <Card key={intro.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={intro.requester.profileImageUrl || ""} />
                            <AvatarFallback className="bg-primary text-white">
                              {getInitials(intro.requester.firstName, intro.requester.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-slate-800">
                                {intro.requester.firstName} {intro.requester.lastName}
                              </h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-secondary mb-3">
                              {intro.requester.age && <span>{intro.requester.age} years old</span>}
                              {intro.requester.location && <span>• {intro.requester.location}</span>}
                              <span>• Connected {formatTimeAgo(intro.respondedAt || intro.createdAt)}</span>
                            </div>
                            
                            <Button size="sm" className="bg-primary hover:bg-blue-600">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Start Conversation
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-4">
                {pastIntroductions.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No introduction history</h3>
                      <p className="text-secondary">Past introductions and declined requests will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  pastIntroductions.map((intro) => {
                    const StatusIcon = getStatusIcon(intro.status);
                    
                    return (
                      <Card key={intro.id} className="opacity-75">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={intro.requester.profileImageUrl || ""} />
                              <AvatarFallback className="bg-secondary text-white">
                                {getInitials(intro.requester.firstName, intro.requester.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-slate-800">
                                  {intro.requester.firstName} {intro.requester.lastName}
                                </h3>
                                <Badge className={`text-xs border ${getStatusColor(intro.status)}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {intro.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-secondary">
                                <span>{formatTimeAgo(intro.respondedAt || intro.createdAt)}</span>
                                {intro.status === 'completed' && (
                                  <span className="text-green-600">• Conversation completed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
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
