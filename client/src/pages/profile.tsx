import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import ProfileEditor from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Edit3, 
  Settings, 
  Shield, 
  Activity, 
  Heart,
  MessageCircle,
  Users,
  Star,
  MapPin,
  Briefcase,
  Camera,
  LogOut
} from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onlineCount } = useWebSocket((user as any)?.id);
  const [isEditing, setIsEditing] = useState(false);



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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Mock data for user activity and connections
  const profileStats = {
    responses: 47,
    connections: 23,
    groupsJoined: 8,
    trustScore: 4.8,
    totalLikes: 156,
    commentsGiven: 89,
  };

  const recentActivity = [
    {
      type: "response",
      content: "Shared thoughts on finding balance between work and personal life",
      timeAgo: "2 hours ago",
      likes: 12,
      comments: 5,
    },
    {
      type: "comment", 
      content: "Commented on a discussion about mindful morning routines",
      timeAgo: "1 day ago",
      likes: 8,
    },
    {
      type: "connection",
      content: "Connected with Alex Thompson through an introduction",
      timeAgo: "3 days ago",
    },
    {
      type: "group",
      content: "Joined the 'Mindfulness & Wellness' group",
      timeAgo: "1 week ago",
    },
  ];

  const connections = [
    {
      id: "1",
      name: "Alex Thompson",
      title: "UX Designer",
      location: "San Francisco",
      connectedDate: "2024-01-15",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Maya Patel", 
      title: "Software Engineer",
      location: "Seattle",
      connectedDate: "2024-01-12",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Jordan Miller",
      title: "Creative Writer", 
      location: "Portland",
      connectedDate: "2024-01-08",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  // Show loading state during authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // Show profile content even if user data is minimal
  if (!isAuthenticated) {
    return null; // Will trigger redirect in useEffect
  }

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user as any} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {/* Profile Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h1 className="text-2xl font-bold text-slate-800">
                        {(user as any)?.firstName} {(user as any)?.lastName}
                      </h1>
                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center space-x-4 text-sm text-secondary mb-3">
                      {(user as any)?.city && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{(user as any)?.city}</span>
                        </div>
                      )}
                      {(user as any)?.dateOfBirth && (
                        <span>{new Date().getFullYear() - new Date((user as any).dateOfBirth).getFullYear()} years old</span>
                      )}
                      {(user as any)?.role === 'admin' && (
                        <Badge className="bg-accent text-white">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    
                    {(user as any)?.personalIntro && (
                      <p className="text-slate-600 mb-3">{(user as any)?.personalIntro}</p>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{profileStats.trustScore}</span>
                        <span className="text-sm text-secondary">Trust Score</span>
                      </div>
                      <div className="text-sm text-secondary">
                        Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{profileStats.responses}</div>
                  <div className="text-sm text-secondary">Responses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{profileStats.connections}</div>
                  <div className="text-sm text-secondary">Connections</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{profileStats.groupsJoined}</div>
                  <div className="text-sm text-secondary">Groups</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{profileStats.totalLikes}</div>
                  <div className="text-sm text-secondary">Total Likes</div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Tabs */}
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="connections">
                  <Users className="h-4 w-4 mr-2" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="edit-profile">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                {/* Community Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Profile Completeness</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Trust Building</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Active Participation</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            {activity.type === 'response' && <MessageCircle className="h-4 w-4 text-primary" />}
                            {activity.type === 'comment' && <Heart className="h-4 w-4 text-primary" />}
                            {activity.type === 'connection' && <Users className="h-4 w-4 text-primary" />}
                            {activity.type === 'group' && <Users className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">{activity.content}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-secondary">
                              <span>{activity.timeAgo}</span>
                              {activity.likes && (
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{activity.likes}</span>
                                </div>
                              )}
                              {activity.comments && (
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{activity.comments}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={connection.avatar} />
                            <AvatarFallback className="bg-primary text-white">
                              {connection.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{connection.name}</h4>
                            <p className="text-sm text-secondary">{connection.title}</p>
                            <p className="text-sm text-secondary flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {connection.location}
                            </p>
                            <p className="text-xs text-secondary mt-1">
                              Connected {new Date(connection.connectedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Account Settings Tab */}
              {/* Edit Profile Tab */}
              <TabsContent value="edit-profile" className="space-y-4">
                <ProfileEditor 
                  user={user as any}
                  onSuccess={() => {
                    toast({
                      title: "Profile Updated",
                      description: "Your changes have been saved successfully.",
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <RightSidebar userId={(user as any)?.id} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
