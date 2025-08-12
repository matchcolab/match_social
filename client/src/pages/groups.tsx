import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus, 
  Heart, 
  Laptop, 
  Dumbbell, 
  Book, 
  Camera, 
  Music,
  Crown 
} from "lucide-react";
import type { Group, User } from "@shared/schema";

type GroupWithDetails = Group & { 
  isJoined?: boolean; 
  role?: string;
  recentMembers?: User[];
};

export default function Groups() {
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

  const { data: allGroups = [], isLoading: groupsLoading } = useQuery<GroupWithDetails[]>({
    queryKey: ["/api/groups"],
  });

  const { data: userGroups = [], isLoading: userGroupsLoading } = useQuery<(Group & { role: string })[]>({
    queryKey: ["/api/user/groups"],
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/groups"] });
      toast({
        title: "Joined group!",
        description: "Welcome to your new community.",
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
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("DELETE", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/groups"] });
      toast({
        title: "Left group",
        description: "You've left the group.",
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
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getGroupIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('single') || lowerName.includes('dating') || lowerName.includes('relationship')) {
      return Heart;
    } else if (lowerName.includes('tech') || lowerName.includes('professional') || lowerName.includes('career')) {
      return Laptop;
    } else if (lowerName.includes('fitness') || lowerName.includes('wellness') || lowerName.includes('health')) {
      return Dumbbell;
    } else if (lowerName.includes('book') || lowerName.includes('reading')) {
      return Book;
    } else if (lowerName.includes('photo') || lowerName.includes('art')) {
      return Camera;
    } else if (lowerName.includes('music')) {
      return Music;
    }
    return Users;
  };

  const getGroupGradient = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('single') || lowerName.includes('dating') || lowerName.includes('relationship')) {
      return "from-purple-500 to-pink-500";
    } else if (lowerName.includes('tech') || lowerName.includes('professional') || lowerName.includes('career')) {
      return "from-green-500 to-blue-500";
    } else if (lowerName.includes('fitness') || lowerName.includes('wellness') || lowerName.includes('health')) {
      return "from-orange-500 to-red-500";
    } else if (lowerName.includes('book') || lowerName.includes('reading')) {
      return "from-amber-500 to-orange-500";
    } else if (lowerName.includes('photo') || lowerName.includes('art')) {
      return "from-violet-500 to-purple-500";
    } else if (lowerName.includes('music')) {
      return "from-pink-500 to-rose-500";
    }
    return "from-primary to-accent";
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading your groups...</p>
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
          <div className="max-w-6xl mx-auto p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">My Groups</h1>
              <p className="text-secondary">Connect with communities that share your interests</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input 
                placeholder="Search groups..." 
                className="pl-10 bg-white border-slate-200"
              />
            </div>

            {/* My Groups Section */}
            {!userGroupsLoading && userGroups.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Your Groups</h2>
                  <Badge variant="secondary">{userGroups.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userGroups.map((group) => {
                    const IconComponent = getGroupIcon(group.name);
                    const gradientClass = getGroupGradient(group.name);
                    
                    return (
                      <Card key={group.id} className="hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{group.name}</CardTitle>
                              <div className="flex items-center space-x-2 text-sm text-secondary">
                                <span>{group.memberCount} members</span>
                                {group.role === 'admin' && (
                                  <Badge variant="outline" className="text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {group.description || "Connect with like-minded community members"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-sm text-accent">
                              <div className="w-2 h-2 bg-accent rounded-full"></div>
                              <span>{group.activeCount || Math.floor(Math.random() * 15) + 5} active</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => leaveGroupMutation.mutate(group.id)}
                              disabled={leaveGroupMutation.isPending}
                              className="text-xs"
                            >
                              Leave
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Discover Groups Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Discover Groups</h2>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>

              {groupsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 mb-3">
                          <div className="h-3 bg-slate-200 rounded"></div>
                          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                          <div className="h-8 bg-slate-200 rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allGroups
                    .filter(group => !userGroups.some(ug => ug.id === group.id))
                    .map((group) => {
                      const IconComponent = getGroupIcon(group.name);
                      const gradientClass = getGroupGradient(group.name);
                      
                      return (
                        <Card key={group.id} className="hover:shadow-md transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-lg flex items-center justify-center`}>
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-base">{group.name}</CardTitle>
                                <p className="text-sm text-secondary">{group.memberCount} members</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {group.description || "Connect with like-minded community members"}
                            </p>
                            
                            {/* Recent Members Preview */}
                            {group.recentMembers && group.recentMembers.length > 0 && (
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="flex -space-x-2">
                                  {group.recentMembers.slice(0, 3).map((member, index) => (
                                    <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                                      <AvatarImage src={member.profileImageUrl || ""} />
                                      <AvatarFallback className="text-xs bg-primary text-white">
                                        {`${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <span className="text-xs text-secondary">Recent members</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-sm text-accent">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                <span>{group.activeCount || Math.floor(Math.random() * 20) + 5} active</span>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => joinGroupMutation.mutate(group.id)}
                                disabled={joinGroupMutation.isPending}
                                className="px-4"
                              >
                                {joinGroupMutation.isPending ? "Joining..." : "Join"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}

              {!groupsLoading && allGroups.filter(group => !userGroups.some(ug => ug.id === group.id)).length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No new groups to discover</h3>
                    <p className="text-secondary mb-4">All available groups have been joined or are not suitable matches.</p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Group
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
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
